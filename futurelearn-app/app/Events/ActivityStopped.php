<?php
namespace App\Events;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ActivityStopped implements ShouldBroadcastNow {
    use Dispatchable, InteractsWithSockets, SerializesModels;
    public $pinCode;
    public function __construct($pinCode) { $this->pinCode = $pinCode; }
    public function broadcastOn() { return new Channel('session.' . $this->pinCode); }
    public function broadcastAs() { return 'ActivityStopped'; }
}