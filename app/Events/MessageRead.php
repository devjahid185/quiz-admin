<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageRead implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $conversationId;
    public $readerId;
    public $otherUserId;

    public function __construct($conversationId, $readerId, $otherUserId)
    {
        $this->conversationId = $conversationId;
        $this->readerId = $readerId;
        $this->otherUserId = $otherUserId;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('chat.' . $this->otherUserId),
            new Channel('conversation.' . $this->conversationId),
        ];
    }

    public function broadcastAs()
    {
        return 'MessageRead';
    }

    public function broadcastWith()
    {
        return [
            'conversation_id' => $this->conversationId,
            'reader_id' => $this->readerId,
        ];
    }
}
