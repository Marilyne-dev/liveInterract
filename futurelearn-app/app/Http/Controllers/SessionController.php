<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Carbon\Carbon;
use Illuminate\Support\Str;
use App\Events\PrivateMessageSent;
use App\Events\SessionClosed;
use App\Events\MessageReactionReceived;
use App\Events\PrivateResponseSent;
use App\Services\ProfanityFilter;


class SessionController extends Controller
{
   public function index()
    {
        // On récupère les sessions dans la base Laravel
        $sessions = DB::table('fl_sessions')
            ->orderBy('created_at', 'desc')
            ->get();

        // On va chercher les noms des profs dans la base Moodle pour chaque session
        $formatted = $sessions->map(function($s) {
            $user = DB::connection('moodle_conn')
                ->table('mdl_user')
                ->where('id', $s->moodle_user_id)
                ->first();

            $s->firstname = $user ? $user->firstname : 'Prof';
            $s->lastname = $user ? $user->lastname : 'Inconnu';
            
            $s->message_count = DB::table('fl_messages')->where('session_id', $s->id)->count();
            $s->participant_count = DB::table('fl_participants')->where('session_id', $s->id)->count();
            
            return $s;
        });

        return response()->json($formatted);
    }


    
   
  public function store(Request $request)
{
    try {
        $pin = strtoupper(Str::random(6));
        $scheduledAt = $request->started_at ? Carbon::parse($request->started_at)->format('Y-m-d H:i:s') : null;
        $expiresAt = $request->expires_at ? Carbon::parse($request->expires_at)->format('Y-m-d H:i:s') : null;
        $status = 'active'; 
        if ($scheduledAt && Carbon::parse($scheduledAt)->isFuture()) {
            $status = 'planned';
        }
        $id = DB::table('fl_sessions')->insertGetId([
            'title'            => $request->title,
            'pin_code'         => $pin,
            'status'           => (string) $status,
            'duration_minutes' => 60,
            'scheduled_at'     => $scheduledAt,
            'expires_at'       => $expiresAt,
            'moodle_user_id'   => $request->moodle_user_id ?? 1,
            'created_at'       => now(),
            'updated_at'       => now(),
        ]);
        $session = DB::table('fl_sessions')->where('id', $id)->first();
        return response()->json($session, 201);
    } catch (\Exception $e) {
        return response()->json([
            'error' => "Erreur lors de l'insertion",
            'details' => $e->getMessage()
        ], 500);
    }
}

    public function startSession($id) {
        DB::table('fl_sessions')->where('id', $id)->update([
            'status' => 'active',
            'expires_at' => Carbon::now()->addMinutes(60),
            'updated_at' => Carbon::now()
        ]);
        return response()->json(['status' => 'active']);
    }

    public function teacherSessions($id)
    {
        return response()->json(DB::table('fl_sessions')->where('moodle_user_id', $id)->orderBy('created_at', 'desc')->get());
    }

   // Ta méthode join est déjà pas mal, on s'assure qu'elle broadcast bien
     public function join(Request $request) 
        {
            $session = DB::table('fl_sessions')->where('pin_code', $request->pin_code)->first();
            if (!$session) return response()->json(['error' => 'Session introuvable'], 404);
            if ($session->status === 'closed') {
                return response()->json(['error' => 'Cette session est déjà clôturée'], 403);
            }

            DB::table('fl_participants')->updateOrInsert(
                ['session_id' => $session->id, 'student_id' => $request->student_id],
                ['updated_at' => now()]
            );

            $userName = "Étudiant " . substr($request->student_id, -4);
            
            broadcast(new \App\Events\UserJoined($session->pin_code, $request->student_id, $userName))->toOthers();

            return response()->json(['session' => $session]);
        }


    // Dans SessionController.php

public function destroy($id) 
{
    $session = DB::table('fl_sessions')->where('id', $id)->first();
    if ($session) {
        // On prévient les étudiants connectés
        
        // AU LIEU DE DELETE, on change le statut et on garde les données
        DB::table('fl_sessions')->where('id', $id)->update([
            'status' => 'closed',
            'updated_at' => now()
        ]);
        
        // On ferme aussi toutes les activités de cette session
        DB::table('fl_activities')->where('session_id', $id)->update(['status' => 'closed']);
        broadcast(new \App\Events\SessionClosed($session->pin_code));
    }
    return response()->json(['message' => 'Session clôturée avec succès']);
}


public function sendMessage(Request $request) 
{
    try {
        if (ProfanityFilter::hasProfanity((string)$request->content)) {
            return response()->json(['error' => 'Votre message contient des termes inappropriés et enfreint les règles de sécurité de la session.'], 400);
        }

        $session = DB::table('fl_sessions')->where('id', $request->session_id)->first();
        if (!$session) return response()->json(['error' => 'Session non trouvée'], 404);

        // 1️⃣ Question pour l'onglet "Questions" du prof
        $data = [
            'session_id'     => (int) $request->session_id,
            'user_name'      => "Étudiant " . substr($request->user_id, -4),
            'moodle_user_id' => (string) $request->user_id, 
            'content'        => $request->content,
            'created_at'     => now(), 
            'updated_at'     => now(),
        ];
        $id = DB::table('fl_messages')->insertGetId($data);
        $fullMessage = DB::table('fl_messages')->where('id', $id)->first();

        // 2️⃣ Message pour l'historique du Chat Privé
        $privateMsgId = DB::table('private_messages')->insertGetId([
            'session_id'  => $request->session_id,
            'sender_id'   => $request->user_id,
            'receiver_id' => 'PROF-' . $session->moodle_user_id,
            'content'     => $request->content,
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);
        $fullPrivateMessage = DB::table('private_messages')->where('id', $privateMsgId)->first();

        //  SIGNAL 1 : Pour l'onglet "Questions" (Prof)
        broadcast(new \App\Events\NewChatMessage($fullMessage, $session->pin_code));

        // SIGNAL 2 : Pour le CHAT PRIVÉ (Temps réel pour les deux)
        //  Sans .toOthers()
            broadcast(new \App\Events\PrivateMessageSent(
                $fullPrivateMessage, 
                $request->user_id, 
                'PROF-' . $session->moodle_user_id
            ));

        return response()->json($fullMessage);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
}

public function getSessionData($pin) {
    $session = DB::table('fl_sessions')->where('pin_code', $pin)->first();
    
    if (!$session) {
        return response()->json(['error' => 'Session non trouvée'], 404);
    }
    
    $activeActivity = DB::table('fl_activities')
        ->where('session_id', $session->id)
        ->where('status', 'open')
        ->orderBy('created_at', 'desc')
        ->first();

    if($activeActivity) {
        $activeActivity->options = json_decode($activeActivity->options);
    }

    return response()->json([
        'session' => $session,
        'status' => $session->status,
        // TRIER PAR DESC POUR QUE LE PLUS RÉCENT SOIT EN HAUT
        'messages' => DB::table('fl_messages')
            ->where('session_id', $session->id)
            ->orderBy('created_at', 'desc') 
            ->get(),
        'activeActivity' => $activeActivity
    ]);
}

public function getSessionStatus($pin) {
    $session = DB::table('fl_sessions')
        ->where('pin_code', $pin)
        ->select('id', 'pin_code', 'status', 'updated_at')
        ->first();

    if (!$session) {
        return response()->json(['error' => 'Session non trouvée'], 404);
    }

    return response()->json([
        'id' => $session->id,
        'pin_code' => $session->pin_code,
        'status' => $session->status,
        'updated_at' => $session->updated_at,
    ]);
}

    
// SessionController.php

// SessionController.php

    public function getParticipants($pin_code) {
        $session = DB::table('fl_sessions')->where('pin_code', $pin_code)->first();
        if (!$session) return response()->json([], 404);

        // On récupère TOUS les participants déjà enregistrés pour cette session
        $participants = DB::table('fl_participants')
            ->where('session_id', $session->id)
            ->get();

        // On formate pour React
        $formatted = $participants->map(function($p) {
            return [
                'id' => $p->student_id,
                'name' => "Étudiant " . substr($p->student_id, -4)
            ];
        });

        return response()->json($formatted);
    }

public function getSummary($pin_code) {
    $session = DB::table('fl_sessions')->where('pin_code', $pin_code)->first();
    if (!$session) return response()->json(['error' => 'Session introuvable'], 404);

    $activityController = new ActivityController();
    $history = $activityController->history($session->id);
    $scores = DB::table('fl_session_scores')->where('session_id', $session->id)->get();
    
    // NOUVEAU : On récupère les chats pour les archives !
    $questions = DB::table('fl_messages')->where('session_id', $session->id)->orderBy('created_at', 'asc')->get();
    $community = DB::table('fl_community_messages')->where('session_id', $session->id)->orderBy('created_at', 'asc')->get();

    return response()->json([
        'session_title' => $session->title,
        'summary' => $history->original,
        'summary_scores' => $scores,
        'questions' => $questions, // On les envoie à React
        'community' => $community  // On les envoie à React
    ]);
}

public function getTopLikedCommunityMessages($pin) {
    $session = DB::table('fl_sessions')->where('pin_code', $pin)->first();
    if (!$session) return response()->json(['error' => 'Session introuvable'], 404);

    $messages = DB::table('fl_community_messages')
        ->where('session_id', $session->id)
        ->orderByRaw('(SELECT COUNT(*) FROM fl_community_reactions WHERE fl_community_reactions.message_id = fl_community_messages.id AND type = "like") DESC')
        ->orderBy('created_at', 'desc')
        ->get()
        ->map(function($m) {
            // On compte les réactions pour chaque message
            $m->likes_count = DB::table('fl_community_reactions')->where('message_id', $m->id)->where('type', 'like')->count();
            $m->love_count = DB::table('fl_community_reactions')->where('message_id', $m->id)->where('type', 'love')->count();
            return $m;
        });

    return response()->json($messages);
}


public function sendCommunityMessage(Request $request)
{
    // Vérifie que les données arrivent bien
    if(!$request->content || !$request->session_id) {
        return response()->json(['error' => 'Data missing'], 400);
    }

    if (ProfanityFilter::hasProfanity((string)$request->content)) {
        return response()->json(['error' => 'Votre message contient des termes inappropriés et enfreint les règles de sécurité de la session.'], 400);
    }

    // IMPORTANT : Récupérer la session pour avoir le PIN CODE
    $session = DB::table('fl_sessions')->where('id', $request->session_id)->first();
    if (!$session) {
        return response()->json(['error' => 'Session not found'], 404);
    }

    $id = DB::table('fl_community_messages')->insertGetId([
        'session_id' => $request->session_id,
        'user_id' => $request->user_id,
        'user_name' => $request->user_name ?? 'Anonyme',
        'content' => $request->content,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $fullMessage = DB::table('fl_community_messages')->where('id', $id)->first();
    
    // IMPORTANT : On s'assure que les compteurs existent pour React
    $fullMessage->likes_count = 0;
    $fullMessage->love_count = 0;

    // UTILISER LE PIN CODE DE LA SESSION, PAS LA REQUÊTE
    broadcast(new \App\Events\NewCommunityMessage($fullMessage, $session->pin_code));

    return response()->json($fullMessage);
}


public function getCommunityMessages($pin)
{
    $session = DB::table('fl_sessions')->where('pin_code', $pin)->first();
    
    $messages = DB::table('fl_community_messages')
        ->where('session_id', $session->id)
        ->orderBy('created_at', 'asc')
        ->get()
        ->map(function($m) {
            // On compte les réactions pour chaque message
            $m->likes_count = DB::table('fl_community_reactions')->where('message_id', $m->id)->where('type', 'like')->count();
            $m->love_count = DB::table('fl_community_reactions')->where('message_id', $m->id)->where('type', 'love')->count();
            return $m;
        });

    return response()->json($messages);
}
   

public function reactToCommunityMessage(Request $request, $id) {
    try {
        // Vérifier si l'utilisateur a déjà réagi à ce message
        $existingReaction = DB::table('fl_community_reactions')
            ->where('message_id', $id)
            ->where('user_id', $request->user_id)
            ->first();

        if ($existingReaction) {
            // Si c'est la même réaction, on ne fait rien
            if ($existingReaction->type === $request->type) {
                return response()->json(['status' => 'already_reacted']);
            }
            // Sinon, on met à jour la réaction
            DB::table('fl_community_reactions')
                ->where('id', $existingReaction->id)
                ->update(['type' => $request->type, 'updated_at' => now()]);
        } else {
            // Nouvelle réaction
            DB::table('fl_community_reactions')->insert([
                'message_id' => $id,
                'type' => $request->type,
                'user_id' => $request->user_id,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }

        // 2. On compte les réactions mises à jour
        $reactions = [
            'likes' => DB::table('fl_community_reactions')->where('message_id', $id)->where('type', 'like')->count(),
            'love' => DB::table('fl_community_reactions')->where('message_id', $id)->where('type', 'love')->count()
        ];

        // 3. ON DIFFUSE (Vérifie bien que pin_code est envoyé par React)
        broadcast(new \App\Events\CommunityReactionReceived($id, $reactions, $request->pin_code));

        return response()->json(['status' => 'OK', 'reactions' => $reactions]);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
}

public function sendPrivateResponse(Request $request) {
    try {
        if (ProfanityFilter::hasProfanity((string)$request->content)) {
            return response()->json(['error' => 'Votre message contient des termes inappropriés et enfreint les règles de sécurité de la session.'], 400);
        }

        // Valider le message existe
        $originalMessage = DB::table('fl_messages')->where('id', $request->message_id)->first();
        if (!$originalMessage) {
            return response()->json(['error' => 'Message original non trouvé'], 404);
        }

        // Insérer la réponse
        $id = DB::table('fl_private_responses')->insertGetId([
            'message_id'      => (int) $request->message_id,
            'professor_id'    => $request->professor_id,
            'student_user_id' => $request->student_user_id,
            'content'         => $request->content,
            'created_at'      => now(),
            'updated_at'      => now(),
        ]);

        $response = DB::table('fl_private_responses')->where('id', $id)->first();

        // BROADCAST à l'étudiant AVEC LE MESSAGE_ID
        broadcast(new \App\Events\PrivateResponseSent($response, $request->student_user_id))->toOthers();

        return response()->json($response);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
}

public function getPrivateResponses($userId) {
    try {
        $responses = DB::table('fl_private_responses')
            ->join('fl_messages', 'fl_private_responses.message_id', '=', 'fl_messages.id')
            ->where('fl_private_responses.student_user_id', $userId)
            ->select('fl_private_responses.*', 'fl_messages.content as original_question')
            ->orderBy('fl_private_responses.created_at', 'asc')
            ->get();

        return response()->json($responses);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
}


public function sendPrivateMessage(Request $request)
{
    if (ProfanityFilter::hasProfanity((string)$request->content)) {
        return response()->json(['error' => 'Votre message contient des termes inappropriés et enfreint les règles de sécurité de la session.'], 400);
    }

    $messageId = DB::table('private_messages')->insertGetId([
        'session_id'  => $request->session_id,
        'sender_id'   => $request->sender_id,
        'receiver_id' => $request->receiver_id,
        'content'     => $request->content,
        'created_at'  => now(),
        'updated_at'  => now(),
    ]);

    $message = DB::table('private_messages')->where('id', $messageId)->first();

    // 🔑 DIFFUSER SUR LES DEUX CANAUX
    broadcast(new PrivateMessageSent(
        $message,
        $message->sender_id,
        $message->receiver_id
    ));

    return response()->json($message, 201);
}



public function getPrivateMessages($userId) {
    try {
        // Récupérer tous les messages où l'utilisateur est sender ou receiver
        $messages = DB::table('private_messages')
            ->where(function($query) use ($userId) {
                $query->where('sender_id', $userId)
                      ->orWhere('receiver_id', $userId);
            })
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($messages);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
}

 public function getChatPartners($userId)
    {
        try {
            \Log::info("📞 getChatPartners demandé par: $userId");

            // 1️⃣ Récupérer tous les IDs uniques avec qui cet utilisateur a parlé
            $partnerIds = DB::table('private_messages')
                ->where(function($q) use ($userId) {
                    $q->where('sender_id', $userId)
                      ->orWhere('receiver_id', $userId);
                })
                ->selectRaw('CASE 
                    WHEN sender_id = ? THEN receiver_id 
                    ELSE sender_id 
                END as partner_id', [$userId])
                ->distinct()
                ->pluck('partner_id')
                ->unique()
                ->values();

            \Log::info("📞 Partenaires trouvés: " . $partnerIds->count());

            // 2️⃣ Pour chaque partenaire, récupérer le dernier message et les non-lus
            $partners = $partnerIds->map(function($partnerId) use ($userId) {
                // Dernier message
                $lastMessage = DB::table('private_messages')
                    ->where(function($q) use ($userId, $partnerId) {
                        $q->where('sender_id', $userId)->where('receiver_id', $partnerId);
                    })
                    ->orWhere(function($q) use ($userId, $partnerId) {
                        $q->where('sender_id', $partnerId)->where('receiver_id', $userId);
                    })
                    ->orderBy('created_at', 'desc')
                    ->first();

                // Nombre de messages non-lus
                $unreadCount = DB::table('private_messages')
                    ->where('sender_id', $partnerId)
                    ->where('receiver_id', $userId)
                    ->where('is_read', false)
                    ->count();

                return [
                    'user_id' => $partnerId,
                    'last_message' => $lastMessage?->content ?? 'Nouvelle conversation',
                    'last_message_time' => $lastMessage?->created_at ?? null,
                    'unread_count' => $unreadCount,
                ];
            });

            return response()->json($partners);

        } catch (\Exception $e) {
            \Log::error("❌ Erreur getChatPartners", ['error' => $e->getMessage()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    

 public function getConversation($userId1, $userId2)
    {
        try {
            \Log::info("💬 Conversation demandée entre: $userId1 et $userId2");

            // 1️⃣ Récupérer TOUS les messages échangés entre ces deux utilisateurs
            $messages = DB::table('private_messages')
                ->where(function($q) use ($userId1, $userId2) {
                    $q->where(function($inner) use ($userId1, $userId2) {
                        $inner->where('sender_id', $userId1)
                              ->where('receiver_id', $userId2);
                    })->orWhere(function($inner) use ($userId1, $userId2) {
                        $inner->where('sender_id', $userId2)
                              ->where('receiver_id', $userId1);
                    });
                })
                ->orderBy('created_at', 'asc')  // Du plus ancien au plus récent
                ->get();

            \Log::info("💬 Messages trouvés: " . $messages->count());

            // 2️⃣ Marquer les messages reçus comme "lus"
            DB::table('private_messages')
                ->where('receiver_id', $userId1)
                ->where('sender_id', $userId2)
                ->update(['is_read' => true, 'updated_at' => now()]);

            return response()->json($messages);

        } catch (\Exception $e) {
            \Log::error("❌ Erreur getConversation", ['error' => $e->getMessage()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function loadChatPartners($userId)
    {
        return $this->getChatPartners($userId);
    }

public function exportScores($id) {
    $scores = DB::table('fl_session_scores')->where('session_id', $id)->get();
    $session = DB::table('fl_sessions')->where('id', $id)->first();

    $fileName = 'resultats_session_' . $session->pin_code . '.csv';
    $headers = [
        "Content-type"        => "text/csv",
        "Content-Disposition" => "attachment; filename=$fileName",
        "Pragma"              => "no-cache",
        "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
        "Expires"             => "0"
    ];

    $columns = ['Etudiant', 'XP Totale', 'Bonnes Réponses', 'Date'];

    $callback = function() use($scores, $columns) {
        $file = fopen('php://output', 'w');
        fputcsv($file, $columns);
        foreach ($scores as $s) {
            fputcsv($file, [$s->user_name, $s->xp_points, $s->correct_answers, $s->updated_at]);
        }
        fclose($file);
    };

    return response()->stream($callback, 200, $headers);
}

public function getFullArchive($pin_code) {
    $session = DB::table('fl_sessions')->where('pin_code', $pin_code)->first();
    if (!$session) return response()->json(['error' => 'Invalide'], 404);

    // 1. Toutes les activités et leurs résultats
    $activityController = new ActivityController();
    $activities = $activityController->history($session->id)->original;

    // 2. Tous les messages de la communauté
    $community = DB::table('fl_community_messages')
        ->where('session_id', $session->id)
        ->orderBy('created_at', 'asc')
        ->get();

    // 3. Toutes les questions posées au prof
    $questions = DB::table('fl_messages')
        ->where('session_id', $session->id)
        ->orderBy('created_at', 'asc')
        ->get();

    // 4. Le classement final
    $scores = DB::table('fl_session_scores')
        ->where('session_id', $session->id)
        ->orderBy('xp_points', 'desc')
        ->get();

    return response()->json([
        'session' => $session,
        'activities' => $activities,
        'community' => $community,
        'questions' => $questions,
        'scores' => $scores
    ]);
}

public function studentHistory($studentId) {
    return DB::table('fl_participants')
        ->join('fl_sessions', 'fl_participants.session_id', '=', 'fl_sessions.id')
        ->where('fl_participants.student_id', $studentId)
        ->where('fl_sessions.status', 'closed') // Uniquement les sessions terminées
        ->select('fl_sessions.*')
        ->orderBy('fl_sessions.created_at', 'desc')
        ->get();
}

// 1. Liste des archives pour le prof
public function teacherHistory($teacherId) {
    return DB::table('fl_sessions')
        ->where('moodle_user_id', $teacherId)
        ->where('status', 'closed')
        ->orderBy('created_at', 'desc')
        ->get();
}

// 2. L'analyse IA (Simulée de façon intelligente)
public function getAIInsights($pin)
{
    $session = DB::table('fl_sessions')->where('pin_code', $pin)->first();
    if (!$session) {
        return response()->json(['error' => 'Session introuvable'], 404);
    }

    // 1. Récupérer des données réelles pour l'IA
    $nbParticipants = DB::table('fl_participants')
        ->where('session_id', $session->id)
        ->count();

    $derniersMessages = DB::table('fl_messages')
        ->where('session_id', $session->id)
        ->orderBy('created_at', 'desc')
        ->limit(5)
        ->pluck('content')
        ->toArray();

    $messagesTexte = implode(', ', $derniersMessages);

    // 2. Préparer le Prompt pour l'IA
    $prompt = "Tu es un assistant pédagogique IA. Analyse cette session de cours :\n- Titre : {$session->title}\n- Nombre d'étudiants : {$nbParticipants}\n- Dernières questions posées : {$messagesTexte}\n\nDonne 3 conseils très courts et concrets pour le professeur afin d'améliorer l'engagement.\nRéponds uniquement sous forme d'un tableau JSON simple comme ceci : [\"Conseil 1\", \"Conseil 2\", \"Conseil 3\"]";

    // 3. Appel à l'API OpenRouter
    $advice = $this->callAI($prompt);

    return response()->json($advice);
}
    public function aiChat(Request $request)
    {
        $userMessage = $request->message;
        $pin = $request->pin_code;
        $userId = $request->user_id;

        $session = DB::table('fl_sessions')->where('pin_code', $pin)->first();
        $isProf = str_contains($userId, 'PROF');

        if ($isProf) {
            $instructions = "Tu es 'Copilote Future Learn', assistant du PROFESSEUR. Aide-le à gérer sa session '" . ($session->title ?? 'Live') . "'.";
        } else {
            $instructions = "Tu es 'Compagnon Future Learn', assistant des ÉTUDIANTS. Aide-les sur comment acceder a une session et participer aux activités de la session '" . ($session->title ?? 'Live') . "' sans tricher.";
        }
        $prompt = $instructions . "\n\nQuestion de l'utilisateur : " . $userMessage;

                $reply = $this->callAI($prompt);
        // If the call returned an error array, respond with IA unavailable message
        if (is_array($reply) && isset($reply['error'])) {
            return response()->json(['reply' => "L'IA est indisponible pour le moment. " . $reply['error']], 500);
        }
        // If the reply is an array (e.g., parsed JSON), convert to string
        if (is_array($reply)) {
            $reply = implode(' ', $reply);
        }
        return response()->json(['reply' => $reply]);
    }
    
    /**
     * Helper to call OpenRouter API.
     */
        private function callAI(string $prompt)
    {
        // Helper to call OpenRouter API with fallback to Gemini if unavailable
        $apiKey = env('OPENROUTER_API_KEY');
        $model = env('OPENROUTER_MODEL', 'openai/gpt-3.5-turbo'); // default model
        $url = "https://openrouter.ai/api/v1/chat/completions";
        $payload = [
            'model' => $model,
            'messages' => [
                ['role' => 'user', 'content' => $prompt]
            ],
            'temperature' => 0.7,
        ];
        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer $apiKey",
                'Content-Type' => 'application/json',
                'HTTP-Referer' => env('APP_URL', 'http://localhost')
            ])->post($url, $payload);
            $data = $response->json();
            $text = $data['choices'][0]['message']['content'] ?? '';
            $decoded = json_decode($text, true);
            return $decoded ?? $text;
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }



public function loginTeacher(Request $request) {
    // 1. Chercher l'utilisateur dans la base MOODLE
    $user = DB::connection('moodle_conn')
        ->table('mdl_user')
        ->where('email', $request->email) // ou username
        ->first();

    if (!$user) {
        return response()->json(['error' => 'Utilisateur Moodle introuvable'], 404);
    }

    // 2. Optionnel : Vérifier s'il est vraiment prof dans Moodle (simplifié ici)
    // Pour l'instant, on considère que s'il est dans mdl_user et qu'il accède à ton portail, c'est bon.

    return response()->json([
        'moodle_user_id' => $user->id,
        'firstname' => $user->firstname,
        'lastname' => $user->lastname
    ]);
}

public function authenticateBroadcast(Request $request)
{
    try {
        $channel = $request->input('channel_name', $request->input('channel'));
        
        $isAllowedChannel =
            preg_match('/^private-(private\.)?messages\..+$/', $channel) ||
            preg_match('/^private-chat\.conversation\..+$/', $channel) ||
            preg_match('/^private-community\..+$/', $channel);

        if (!$isAllowedChannel) {
            return response()->json(['error' => 'Canal invalide'], 403);
        }
        
        // Pour les canaux privés, on accepte n'importe quel utilisateur
        // car on n'a pas d'authentification classique
        $signature = hash_hmac(
            'sha256',
            $request->socket_id . ':' . $channel,
            env('REVERB_APP_SECRET')
        );

        return response()->json([
            'auth' => env('REVERB_APP_KEY') . ':' . $signature,
        ]);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
}

public function updatePermissions(Request $request, $id) 
{
    // 1. Mise à jour en base de données
    DB::table('fl_sessions')->where('id', $id)->update([
        'allow_questions'          => $request->allow_questions,
        'is_moderated'             => $request->is_moderated,
        'show_results_to_students' => $request->show_results_to_students,
        'updated_at'               => now(),
    ]);

    $session = DB::table('fl_sessions')->where('id', $id)->first();

    // 2. Préparer les données pour le front
    $permissions = [
        'allow_questions'          => (bool)$request->allow_questions,
        'show_results_to_students' => (bool)$request->show_results_to_students,
    ];

    // 3. Envoyer l'ordre aux élèves en temps réel
    broadcast(new \App\Events\PermissionsUpdated($session->pin_code, $permissions))->toOthers();

    return response()->json(['status' => 'success', 'permissions' => $permissions]);
}

public function loginStudent(Request $request) {
    // 1. Chercher l'étudiant dans la base MOODLE par son email
    $user = DB::connection('moodle_conn')
        ->table('mdl_user')
        ->where('email', $request->email)
        ->first();

    if (!$user) {
        return response()->json(['error' => 'Email non reconnu dans Moodle'], 404);
    }

    // 2. On retourne ses vraies infos
    return response()->json([
        'student_id' => 'STU-' . $user->id, // Identifiant FIXE (id Moodle)
        'firstname' => $user->firstname,
        'lastname' => $user->lastname,
        'email' => $user->email
    ]);
    }

/**
     * Endpoint d'aide pour les utilisateurs.
     * Retourne une description statique ou générée dynamiquement (selon AI_HELP_DYNAMIC) de l'application.
     */
  
    /**
     * Retourne jusqu'à 3 conseils pour le professeur lorsqu'une activité est lancée.
     *
     * @param int $id Identifiant de la session
     */
    public function getAdvice($id)
    {
        // Récupérer la session
        $session = DB::table('fl_sessions')->where('id', $id)->first();
        if (!$session) {
            return response()->json(['error' => 'Session introuvable'], 404);
        }

        // Récupérer les 5 dernières questions posées (messages)
        $questions = DB::table('fl_messages')
            ->where('session_id', $session->id)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->pluck('content')
            ->toArray();

        // Construire le prompt pour l'IA
        $prompt = "Tu es un conseiller pédagogique. À partir de la session intitulée \"{$session->title}\" et des dernières questions suivantes : " . implode(' | ', $questions) . ". Propose exactement trois conseils courts et concrets pour aider le professeur à améliorer l'engagement des étudiants. Retourne uniquement un tableau JSON simple comme [\"Conseil 1\", \"Conseil 2\", \"Conseil 3\"].";

        $advice = $this->callAI($prompt);
        // Si l'IA ne retourne pas un tableau, on renvoie un tableau vide
        if (!is_array($advice)) {
            $advice = [];
        }

        // Limiter à 3 conseils
        $advice = array_slice($advice, 0, 3);

        return response()->json(['advice' => $advice]);
    }


    public function getHelp()
    {
        // Si on veut un texte d'aide généré dynamiquement, on utilise OpenRouter.
        if (env('AI_HELP_DYNAMIC', false)) {
            $prompt = "Tu es un assistant pédagogique pour l'application FutureLearn. Rédige un texte bref (max 300 caractères) expliquant comment utiliser les principales fonctionnalités : connexion prof/étudiant, création de session, chat, réactions, activités, export des scores.";
            $reply = $this->callAI($prompt);
            return response()->json(['help' => $reply]);
        }

        // Aide statique
        $help = [
            'login_prof' => 'Utilisez le formulaire de connexion Prof (email) pour obtenir votre ID Moodle.',
            'login_student' => 'Entrez votre email Moodle pour vous identifier comme étudiant.',
            'creer_session' => 'Le professeur crée une session via le bouton “Nouvelle session”. Un code PIN est généré.',
            'rejoindre' => 'Les étudiants saisissent le PIN dans le champ “Rejoindre” pour entrer dans la session.',
            'chat' => 'Utilisez le chat en temps réel pour poser des questions ou répondre. Les messages privés sont envoyés via le module de messagerie privée.',
            'activites' => 'Le prof lance une activité (QCM, nuage de mots, etc.) depuis le tableau de bord. Les réponses s’affichent en temps réel.',
            'export' => 'Cliquez sur “Export CSV” dans l’onglet admin pour télécharger les scores.'
        ];
        return response()->json(['help' => $help]);
    }
    

}
