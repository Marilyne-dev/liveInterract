<?php
namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PermissionsUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $pinCode;
    public $permissions;

    public function __construct($pinCode, $permissions)
    {
        $this->pinCode = $pinCode;
        $this->permissions = $permissions;
    }

    public function broadcastOn()
    {
        return new Channel('session.' . $this->pinCode);
    }

    public function broadcastAs()
    {
        return 'PermissionsUpdated';
    }
}