<?php
namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserJoined implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $pin_code;
    public $student_id;
    public $user_name;

    public function __construct($pin_code, $student_id, $user_name)
    {
        $this->pin_code = $pin_code;
        $this->student_id = $student_id; // On utilise l'underscore
        $this->user_name = $user_name;
    }

    public function broadcastOn() {
        return new Channel('session.' . $this->pin_code);
    }

    public function broadcastAs() {
        return 'UserJoined';
    }
}