<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB; // <--- Ajoute ça pour la route moodle-users
use App\Http\Controllers\SessionController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ActivityController;

// --- ROUTES STANDARDS (Prof & Étudiant) ---
Route::post('/broadcasting/auth', [SessionController::class, 'authenticateBroadcast']);
Route::post('/sessions', [SessionController::class, 'store']);
Route::post('/sessions/join', [SessionController::class, 'join']); // OK (Persistance)
Route::get('/teacher/{id}/sessions', [SessionController::class, 'teacherSessions']);
Route::get('/sessions/{pin}/status', [SessionController::class, 'getSessionStatus']);
Route::get('/sessions/{pin}/messages', [SessionController::class, 'getSessionData']);
Route::get('/sessions/{pin}/ai-insights', [SessionController::class, 'getAIInsights']);
Route::get('/sessions/{pin_code}/participants', [SessionController::class, 'getParticipants']); // OK (Persistance au refresh)
Route::get('/sessions/{pin}/top-liked-community', [SessionController::class, 'getTopLikedCommunityMessages']);
Route::post('/private-responses', [SessionController::class, 'sendPrivateResponse']);
Route::get('/private-responses/{userId}', [SessionController::class, 'getPrivateResponses']);
Route::post('/private-messages', [SessionController::class, 'sendPrivateMessage']);
Route::get('/private-messages/{userId}', [SessionController::class, 'getPrivateMessages']);
Route::get('/chat-partners/{userId}', [SessionController::class, 'getChatPartners']);
Route::get('/conversation/{userId1}/{userId2}', [SessionController::class, 'getConversation']);
Route::post('/messages', [SessionController::class, 'sendMessage']);
Route::put('/sessions/{id}/permissions', [SessionController::class, 'updatePermissions']);
Route::delete('/sessions/{id}', [SessionController::class, 'destroy']);


// Endpoint d'aide (static ou dynamique)
Route::get('/help', [SessionController::class, 'getHelp']);

// Endpoint de conseils (max 3) pour le prof lors d'une activité
Route::get('/sessions/{id}/advice', [SessionController::class, 'getAdvice']);
Route::prefix('admin')->group(function () {
    Route::get('/sessions', [AdminController::class, 'getGlobalStats']);
    Route::get('/users', [AdminController::class, 'getMoodleUsers']);
    Route::put('/users/{id}/role', [AdminController::class, 'updateUserRole']);
    Route::get('/sessions/{id}/export-csv', [AdminController::class, 'exportSessionCsv']);
});

// --- ACTIVITÉS & SONDAGES ---
Route::post('/sessions/{id}/start', [SessionController::class, 'startSession']);
Route::post('/activities/launch', [ActivityController::class, 'launch']);
Route::post('/activities/{id}/vote', [ActivityController::class, 'vote']);

// --- ROUTE MANQUANTE (Pour ton bouton "LISTE" dans le LiveControl) ---
Route::get('/moodle-users', function() {
    try {
        // On utilise explicitement la connexion vers Moodle
        return DB::connection('moodle_conn')
            ->table('mdl_user')
            ->select('id', 'firstname', 'lastname', 'email')
            ->get();
    } catch (\Exception $e) {
        // Si ça plante, on veut savoir exactement pourquoi
        return response()->json([
            'error' => "Impossible de contacter la base Moodle",
            'details' => $e->getMessage()
        ], 500);
    }
});


// Arrêter un sondage
Route::post('/activities/{id}/stop', [ActivityController::class, 'stop']);

// Récupérer les résultats actuels (pour le graphique du prof au refresh)
Route::get('/activities/{id}/results', function($id) {
    $activity = DB::table('fl_activities')->where('id', $id)->first();
    $options = json_decode($activity->options);
    
    $results = [];
    foreach($options as $opt) {
        $count = DB::table('fl_activity_responses')
            ->where('activity_id', $id)
            ->where('answer', $opt)
            ->count();
        $results[] = ['name' => $opt, 'votes' => $count];
    }
    return response()->json($results);
});

// api.php
Route::get('/sessions/{id}/activities/history', [ActivityController::class, 'history']);
Route::post('/activities/{id}/stop', [ActivityController::class, 'stop']);

Route::get('/sessions/{pin_code}/summary', [SessionController::class, 'getSummary']);

Route::post('/community/messages', [SessionController::class, 'sendCommunityMessage']);
Route::get('/community/{pin}/messages', [SessionController::class, 'getCommunityMessages']);

Route::post('/community/messages/{id}/react', [SessionController::class, 'reactToCommunityMessage']);

Route::get('/sessions/{id}/export', [SessionController::class, 'exportScores']);
Route::get('/student/{studentId}/history', [SessionController::class, 'studentHistory']);

Route::get('/teacher/{id}/history', [SessionController::class, 'teacherHistory']);
Route::get('/sessions/{pin}/ai-insights', [SessionController::class, 'getAIInsights']);

Route::delete('/activities/{id}',[ActivityController::class, 'destroy']);

Route::post('/ai/chat', [SessionController::class, 'aiChat']);


// Route pour l'identification du prof via Moodle
Route::post('/teacher/login', [SessionController::class, 'loginTeacher']);

Route::post('/student/login', [SessionController::class, 'loginStudent']);

Route::get('/test-ai-models', function() {
    $key = env('GEMINI_API_KEY');
    $url = "https://generativelanguage.googleapis.com/v1/models?key=" . $key;
    return Http::withOptions(['verify' => false])->get($url)->json();
});
