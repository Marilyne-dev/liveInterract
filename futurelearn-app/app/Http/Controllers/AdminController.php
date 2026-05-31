<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;


class AdminController extends Controller
{
  public function getGlobalStats()
{
    try {
        $sessions = DB::table('fl_sessions')->get();

        $all = $sessions->map(function($s) {
            $firstname = 'Utilisateur';
            $lastname = 'Moodle';

            // On entoure la recherche Moodle d'un try/catch interne
            try {
                $user = DB::connection('moodle_conn')
                    ->table('mdl_user') // <--- Si votre table s'appelle autrement, changez ici
                    ->where('id', $s->moodle_user_id)
                    ->first();

                if ($user) {
                    $firstname = $user->firstname;
                    $lastname = $user->lastname;
                }
            } catch (\Exception $e) {
                // Si la table mdl_user n'existe pas, on arrive ici.
                // On laisse "Utilisateur Moodle" pour ne pas faire planter l'admin.
                $firstname = "Lien Moodle";
                $lastname = "Cassé";
            }

            return [
                'id' => $s->id,
                'title' => $s->title,
                'pin_code' => $s->pin_code,
                'status' => $s->status,
                'scheduled_at' => $s->scheduled_at,
                'created_at' => $s->created_at,
                'firstname' => $firstname,
                'lastname' => $lastname,
                'message_count' => DB::table('fl_messages')->where('session_id', $s->id)->count(),
                'participant_count' => DB::table('fl_participants')->where('session_id', $s->id)->count(),
            ];
        });

        // Pour les Top Teachers, on fait pareil
        $topTeachers = [];
        try {
            $topTeacherData = DB::table('fl_messages')
                ->join('fl_sessions', 'fl_messages.session_id', '=', 'fl_sessions.id')
                ->select('fl_sessions.moodle_user_id', DB::raw('count(fl_messages.id) as total'))
                ->groupBy('fl_sessions.moodle_user_id')
                ->orderBy('total', 'desc')->take(3)->get();

            foreach($topTeacherData as $t) {
                $u = null;
                try {
                    $u = DB::connection('moodle_conn')->table('mdl_user')->where('id', $t->moodle_user_id)->first();
                } catch(\Exception $e) {}

                $topTeachers[] = [
                    'firstname' => $u ? $u->firstname : 'Prof',
                    'lastname' => $u ? $u->lastname : $t->moodle_user_id,
                    'total' => $t->total
                ];
            }
        } catch (\Exception $e) {}

        return response()->json([
            'live' => $all->where('status', 'active')->values(),
            'planned' => $all->where('status', 'planned')->values(),
            'history' => $all->where('status', 'closed')->values(),
            'topTeachers' => $topTeachers,
            'chartData' => $this->getChartData(),
            'totals' => [
                'active' => $all->where('status', 'active')->count(),
                'total_msgs' => DB::table('fl_messages')->count(),
            ]
        ]);

    } catch (\Exception $e) {
        return response()->json(['error' => true, 'message' => $e->getMessage()], 500);
    }
}


    public function getMoodleUsers() {
    try {
        return response()->json(
            DB::connection('moodle_conn') // On va sur Moodle
            ->table('mdl_user')
            ->leftJoin('futurelearn_db.fl_user_roles', 'mdl_user.id', '=', 'fl_user_roles.moodle_user_id')
            ->select('mdl_user.id', 'mdl_user.firstname', 'mdl_user.lastname', 'mdl_user.email', 
                     DB::raw('COALESCE(fl_user_roles.role, "student") as role'))
            ->get()
        );
    } catch (\Exception $e) {
        // Fallback si la jointure échoue
        $users = DB::connection('moodle_conn')->table('mdl_user')->select('id','firstname','lastname','email')->get();
        return response()->json($users->map(function($u) {
            $u->role = 'student';
            return $u;
        }));
    }
}

    private function getChartData() {
    $chartData = [];
    for ($i = 6; $i >= 0; $i--) {
        $d = \Carbon\Carbon::now()->subDays($i);
        $count = DB::table('fl_messages')->whereDate('created_at', $d->toDateString())->count();
        $chartData[] = ['name' => $d->format('d/m'), 'messages' => $count];
    }
    return $chartData;
}


    public function updateUserRole(Request $request, $id) {
        try {
            DB::table('fl_user_roles')->updateOrInsert(
                ['moodle_user_id' => $id],
                ['role' => $request->role, 'updated_at' => now()]
            );
            return response()->json(['message' => 'OK']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function exportSessionCsv($id) {
        $session = DB::table('fl_sessions')->where('id', $id)->first();
        if (!$session) return response()->json(['error' => 'Not found'], 404);

        $messages = DB::table('fl_messages')->where('session_id', $id)->get();
        
        $csv = "DATE;MESSAGE\n";
        foreach ($messages as $m) {
            $csv .= "{$m->created_at};{$m->content}\n";
        }

        return response()->json([
            'content' => $csv,
            'filename' => "Session_{$session->pin_code}.csv"
        ]);
    }
}