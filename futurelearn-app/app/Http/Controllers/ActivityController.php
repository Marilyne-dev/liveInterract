<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Events\ActivityLaunched;
use App\Events\ActivityVoteReceived;
use App\Events\ActivityStopped;
use Illuminate\Support\Facades\Log;

class ActivityController extends Controller
{
    // 1. LANCER : On enregistre maintenant la "correct_answer"
    // Modifie uniquement ces deux fonctions dans ActivityController.php
public function launch(Request $request)
{
    try {
        $options = is_array($request->options) ? $request->options : [];
        $type = $request->type ?? 'qcm';

        $activityId = DB::table('fl_activities')->insertGetId([
            'pin_code'       => $request->pin_code,
            'session_id'     => $request->session_id,
            'type'           => $type,
            'question'       => $request->question,
            'options'        => json_encode($options),
            'correct_answer' => $request->correct_answer,
            'status'         => 'open',
            'created_at'     => now(),
            'updated_at'     => now(),
        ]);

        $activity = [
            'id'             => $activityId,
            'type'           => $type,
            'question'       => $request->question,
            'options'        => $options,
            'correct_answer' => $request->correct_answer,
            'pin_code'       => $request->pin_code,
            'status'         => 'open'
        ];

        // BROADCAST ISOLÉ — ne crash plus l'API si Pusher a un problème
        try {
            broadcast(new ActivityLaunched($activity));
        } catch (\Exception $broadcastError) {
            Log::error('Broadcast échoué: ' . $broadcastError->getMessage());
        }

        return response()->json($activity);

    } catch (\Exception $e) {
        Log::error('Launch échoué: ' . $e->getMessage());
        return response()->json(['error' => $e->getMessage()], 500);
    }
}

public function vote(Request $request, $id) {
    try {
        $activity = DB::table('fl_activities')->where('id', $id)->first();
        if (!$activity) {
            return response()->json(['error' => 'Activité introuvable'], 404);
        }

        $isCorrect = 0;
        $pointsGagnes = 0;

        // PROTECTION
        $cleanAnswer = strtolower(trim((string) $request->answer));
        $cleanCorrect = strtolower(trim((string) $activity->correct_answer));

        // CALCUL XP
        if ($activity->type === 'qcm') {
            if ($cleanAnswer === $cleanCorrect) {
                $isCorrect = 1;
                $pointsGagnes = 25;
            }
        } else if ($activity->type === 'wordcloud') {
            $pointsGagnes = 20;
        } else {
            $pointsGagnes = 15; // Pour l'échelle et question ouverte
        }

        // 1. ENREGISTRER LA RÉPONSE
        DB::table('fl_activity_responses')->insert([
            'activity_id' => $id,
            'student_id'  => $request->student_id,
            'answer'      => $request->answer,
            'created_at'  => now()
        ]);

        // 2. ENREGISTRER LE SCORE (CORRIGÉ ICI POUR ÉVITER LE CRASH 500)
        $existingScore = DB::table('fl_session_scores')
            ->where('session_id', $activity->session_id)
            ->where('student_id', $request->student_id)
            ->first();

        if ($existingScore) {
            // S'il existe déjà, on additionne
            DB::table('fl_session_scores')->where('id', $existingScore->id)->update([
                'xp_points' => $existingScore->xp_points + $pointsGagnes,
                'correct_answers' => $existingScore->correct_answers + $isCorrect,
                'updated_at' => now()
            ]);
        } else {
            // S'il n'existe pas, on l'insère proprement
            DB::table('fl_session_scores')->insert([
                'session_id' => $activity->session_id,
                'student_id' => $request->student_id,
                'user_name' => "Étudiant " . substr($request->student_id, -4),
                'xp_points' => $pointsGagnes,
                'correct_answers' => $isCorrect,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }

       $leaderboard = DB::table('fl_session_scores')
            ->where('session_id', $activity->session_id)
            ->orderBy('xp_points', 'desc')
            // ->limit(5)  <--- SUPPRIME CETTE LIGNE !
            ->get();

        // 3. ENVOI AU PROF EN TEMPS RÉEL (Si le code arrive ici, le graph s'animera !)
        $session = DB::table('fl_sessions')->where('id', $activity->session_id)->first();

        broadcast(new \App\Events\ActivityVoteReceived($session->pin_code, $request->answer));
        broadcast(new \App\Events\LeaderboardUpdated($session->pin_code, $leaderboard));

        return response()->json(['success' => true]);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
}


    // 2. STOP : On prévient tout le monde que c'est fini pour afficher la correction
    public function stop(Request $request, $id) {
        DB::table('fl_activities')->where('id', $id)->update(['status' => 'closed']);
        
        // On renvoie l'activité pour que les étudiants aient la correction
        $activity = DB::table('fl_activities')->where('id', $id)->first();
        
        broadcast(new ActivityStopped($request->pin_code))->toOthers();
        return response()->json(['message' => 'Activite fermee', 'activity' => $activity]);
    }

    // 3. HISTORY : Intelligent selon le type d'activité
    public function history($sessionId) {
        $activities = DB::table('fl_activities')
            ->where('session_id', $sessionId)
            ->orderBy('created_at', 'desc')
            ->get();

        $history = $activities->map(function($activity) {
            $results = [];
            $totalVotes = DB::table('fl_activity_responses')->where('activity_id', $activity->id)->count();

            // CAS 1 : Activités avec options (QCM, Sondage, Échelle)
            if ($activity->options) {
                $options = json_decode($activity->options);
                foreach($options as $opt) {
                    $count = DB::table('fl_activity_responses')
                        ->where('activity_id', $activity->id)
                        ->where('answer', $opt)
                        ->count();
                    $results[] = [
                        'name' => $opt, 
                        'votes' => $count,
                        'percentage' => $totalVotes > 0 ? round(($count / $totalVotes) * 100) : 0
                    ];
                }
            } 
            // CAS 2 : Activités sans options (Nuage de mots, Question ouverte)
            else {
                $results = DB::table('fl_activity_responses')
                    ->select('answer as name', DB::raw('count(*) as votes'))
                    ->where('activity_id', $activity->id)
                    ->groupBy('answer')
                    ->get();
            }

            return [
                'id'             => $activity->id,
                'type'           => $activity->type,
                'question'       => $activity->question,
                'status'         => $activity->status,
                'correct_answer' => $activity->correct_answer,
                'total'          => $totalVotes,
                'results'        => $results,
                'created_at'     => $activity->created_at
            ];
        });

        return response()->json($history);
    }

    // Supprimer une activité de l'historique
    public function destroy($id) {
        DB::table('fl_activities')->where('id', $id)->delete();
        DB::table('fl_activity_responses')->where('activity_id', $id)->delete();
        return response()->json(['message' => 'Activité supprimée']);
    }
    
}