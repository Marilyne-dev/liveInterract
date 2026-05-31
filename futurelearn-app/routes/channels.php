<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('session.{pin_code}', function ($user, $pin_code) {
    return true;
});

Broadcast::channel('community.{pin_code}', function ($user, $pin_code) {
    return true;
});

