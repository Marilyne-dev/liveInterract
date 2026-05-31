<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SessionController;

Route::get('/', function () {
    return view('welcome');
});

// Override the default broadcasting auth endpoint
Route::post('/broadcasting/auth', [SessionController::class, 'authenticateBroadcast']);
Route::get('/broadcasting/auth', [SessionController::class, 'authenticateBroadcast']);
