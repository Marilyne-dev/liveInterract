<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    // ─── GET /admin/stats ────────────────────────────────────────────────────
    // Tout depuis fl_sessions + users (Laravel DB uniquement, ZERO Moodle)
    public function getGlobalStats()
    {
        try {
            $sessions = DB::table('fl_sessions')
                ->leftJoin('users', 'users.id', '=', 'fl_sessions.moodle_user_id')
                ->select(
                    'fl_sessions.*',
                    // On expose name comme firstname pour ne pas casser AdminHistory
                    'users.name as firstname',
                    DB::raw("'' as lastname"),
                    'users.email as teacher_email'
                )
                ->orderBy('fl_sessions.created_at', 'desc')
                ->get()
                ->map(function ($s) {
                    $s->message_count     = DB::table('fl_messages')->where('session_id', $s->id)->count();
                    $s->participant_count = DB::table('fl_participants')->where('session_id', $s->id)->count();
                    return $s;
                });

            // Top enseignants par nombre de messages reçus
            $topTeachers = DB::table('fl_messages')
                ->join('fl_sessions', 'fl_messages.session_id', '=', 'fl_sessions.id')
                ->join('users', 'users.id', '=', 'fl_sessions.moodle_user_id')
                ->select('users.id', 'users.name', DB::raw('count(fl_messages.id) as total'))
                ->groupBy('users.id', 'users.name')
                ->orderBy('total', 'desc')
                ->take(3)
                ->get()
                ->map(fn($t) => [
                    'firstname' => $t->name,
                    'lastname'  => '',
                    'total'     => $t->total,
                ]);

            return response()->json([
                'live'        => $sessions->where('status', 'active')->values(),
                'planned'     => $sessions->where('status', 'planned')->values(),
                'history'     => $sessions->where('status', 'closed')->values(),
                'topTeachers' => $topTeachers,
                'chartData'   => $this->getChartData(),
                'totals'      => [
                    'active'     => $sessions->where('status', 'active')->count(),
                    'total_msgs' => DB::table('fl_messages')->count(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => true, 'message' => $e->getMessage()], 500);
        }
    }

    // ─── GET /admin/users ────────────────────────────────────────────────────
    // Liste tous les users de la table users (Laravel), rôle inclus
    public function getUsers()
    {
        $users = DB::table('users')
            ->select('id', 'name', 'email', 'role', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($users);
    }

    // ─── PUT /admin/users/{id}/role ───────────────────────────────────────────
    // Met à jour le rôle directement dans la table users
    public function updateUserRole(Request $request, $id)
    {
        $request->validate([
            'role' => 'required|in:student,teacher,admin',
        ]);

        $updated = DB::table('users')
            ->where('id', $id)
            ->update(['role' => $request->role, 'updated_at' => now()]);

        if (!$updated) {
            return response()->json(['error' => 'Utilisateur introuvable'], 404);
        }

        $user = DB::table('users')->where('id', $id)->first();
        return response()->json(['message' => 'Rôle mis à jour', 'user' => $user]);
    }

    // ─── GET /admin/sessions/{id}/export ─────────────────────────────────────
    public function exportSessionCsv($id)
    {
        $session = DB::table('fl_sessions')->where('id', $id)->first();
        if (!$session) return response()->json(['error' => 'Not found'], 404);

        $messages = DB::table('fl_messages')->where('session_id', $id)->get();

        $csv = "DATE;MESSAGE\n";
        foreach ($messages as $m) {
            $csv .= "{$m->created_at};{$m->content}\n";
        }

        return response()->json([
            'content'  => $csv,
            'filename' => "Session_{$session->pin_code}.csv",
        ]);
    }

    // ─── PRIVÉ : données du graphique (7 derniers jours) ─────────────────────
    private function getChartData()
    {
        $chartData = [];
        for ($i = 6; $i >= 0; $i--) {
            $d       = \Carbon\Carbon::now()->subDays($i);
            $count   = DB::table('fl_messages')->whereDate('created_at', $d->toDateString())->count();
            $chartData[] = ['name' => $d->format('d/m'), 'messages' => $count];
        }
        return $chartData;
    }
}
