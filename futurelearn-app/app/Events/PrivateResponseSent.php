<?php

namespace App\Events;
use Illuminate\Broadcasting\Channel; // <--- Import Channel
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow; // <--- Import Now

class PrivateResponseSent implements ShouldBroadcastNow {
    use \Illuminate\Foundation\Events\Dispatchable, \Illuminate\Broadcasting\InteractsWithSockets, \Illuminate\Queue\SerializesModels;

    public $response;
    public $studentUserId;

    public function __construct($response, $studentUserId) {
        $this->response = $response;
        $this->studentUserId = $studentUserId;
    }

            public function broadcastOn(): array {
            return [ new Channel('private.messages.' . $this->studentUserId) ];
        }
        
    public function broadcastAs() {
        return 'private.response.sent';
    }
}