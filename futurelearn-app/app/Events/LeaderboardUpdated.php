<?php
namespace App\Events;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LeaderboardUpdated implements ShouldBroadcastNow {
    use Dispatchable, InteractsWithSockets, SerializesModels;
    public $pinCode; 
    public $leaderboard; // CORRIGÉ : Doit être leaderboard, pas message

    public function __construct($pinCode, $leaderboard) {
        $this->pinCode = $pinCode;
        $this->leaderboard = $leaderboard;
    }
    public function broadcastOn() { return new Channel('session.' . $this->pinCode); }
    public function broadcastAs() { return 'LeaderboardUpdated'; }
}