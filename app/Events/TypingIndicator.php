<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TypingIndicator implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $conversationId;
    public $senderId;
    public $receiverId;
    public $isTyping;

    public function __construct($conversationId, $senderId, $receiverId, $isTyping)
    {
        $this->conversationId = $conversationId;
        $this->senderId = $senderId;
        $this->receiverId = $receiverId;
        $this->isTyping = $isTyping;
    }

    public function broadcastOn(): array
    {
        // ✅ শুধুমাত্র receiver এর কাছে typing indicator যাবে
        return [
            new Channel('chat.' . $this->receiverId),
        ];
    }

    public function broadcastAs()
    {
        return 'TypingIndicator';
    }

    public function broadcastWith()
    {
        return [
            'conversation_id' => $this->conversationId,
            'sender_id' => $this->senderId,
            'is_typing' => $this->isTyping,
        ];
    }
}
