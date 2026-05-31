<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class PrivateMessageSent implements ShouldBroadcastNow
{
    use \Illuminate\Foundation\Events\Dispatchable,
        \Illuminate\Broadcasting\InteractsWithSockets,
        \Illuminate\Queue\SerializesModels;

    public $message;
    public $senderId;
    public $receiverId;

    public function __construct($message, $senderId, $receiverId)
    {
        $this->message = $message;
        $this->senderId = $senderId;
        $this->receiverId = $receiverId;
    }

    public function broadcastOn(): array
    {
        $conversationKey = self::conversationKey($this->senderId, $this->receiverId);

        return [
            new Channel('private.chat.' . $this->senderId),
            new Channel('private.chat.' . $this->receiverId),
            new Channel('chat.conversation.' . $conversationKey),
            new PrivateChannel('chat.conversation.' . $conversationKey),
        ];
    }

    public function broadcastAs()
    {
        return 'private.message.sent';
    }

    private static function conversationKey($userId1, $userId2): string
    {
        $ids = [(string) $userId1, (string) $userId2];
        sort($ids, SORT_STRING);

        return implode('__', array_map(function ($id) {
            return preg_replace('/[^A-Za-z0-9_-]/', '_', $id);
        }, $ids));
    }
}
