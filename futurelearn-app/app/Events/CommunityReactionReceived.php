<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CommunityReactionReceived implements ShouldBroadcastNow {
    use Dispatchable, InteractsWithSockets, SerializesModels;
    public $messageId;
    public $reactions; // Le nouveau compte total des réactions
    public $pinCode;

    public function __construct($messageId, $reactions, $pinCode) {
        $this->messageId = $messageId;
        $this->reactions = $reactions;
        $this->pinCode = $pinCode;
    }

    public function broadcastOn() {
        return [new PrivateChannel('community.' . $this->pinCode)];
    }
    
    public function broadcastAs() {
        return 'reaction.received';
    }
}