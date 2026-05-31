<?php
namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SessionClosed implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $pinCode;

    public function __construct($pinCode) {
        $this->pinCode = $pinCode;
    }

    public function broadcastOn() {
        return new Channel('session.' . $this->pinCode);
    }

    public function broadcastAs() {
        return 'SessionClosed'; // Nom exact pour le .listen()
    }
}