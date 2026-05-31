<?php
namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ActivityLaunched implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $activity;

    public function __construct($activity)
    {
        $this->activity = $activity;
    }

    public function broadcastOn()
    {
        return new Channel('session.' . $this->activity['pin_code']);
    }

    public function broadcastAs()
    {
        return 'ActivityLaunched';
    }
}