<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewCommunityMessage implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;
    public $pinCode;

    public function __construct($message, $pinCode)
    {
        $this->message = $message;
        $this->pinCode = $pinCode;
    }

    public function broadcastOn(): array
    {
        // On diffuse sur un canal spécifique à la communauté
        return [new PrivateChannel('community.' . $this->pinCode)];
    }
        // Dans NewCommunityMessage.php
    public function broadcastAs()
    {
        return 'community.sent';
    }
}
