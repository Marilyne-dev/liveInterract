<?php
namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ActivityVoteReceived implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $pinCode;
    public $answer;

    public function __construct($pinCode, $answer)
    {
        $this->pinCode = $pinCode;
        $this->answer = $answer;
    }

    public function broadcastOn()
    {
        // Doit être identique au canal écouté par le prof
        return new Channel('session.' . $this->pinCode);
    }

    public function broadcastAs()
    {
        return 'ActivityVoteReceived';
    }
}