<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;
    public $receiverId;

    public function __construct($message, $receiverId)
    {
        $this->message = $message;
        $this->receiverId = $receiverId;
    }

    public function broadcastOn(): array
    {
        // ✅ Message শুধুমাত্র receiver এবং sender এর personal channel এ যাবে (conversation channel নয়)
        return [
            new Channel('chat.' . $this->receiverId), // Receiver এর কাছে নতুন message notification
            new Channel('chat.' . $this->message['sender_id']), // Sender এর কাছে নিজের sent message confirmation
        ];
    }

    public function broadcastAs()
    {
        return 'MessageSent';
    }

    public function broadcastWith()
    {
        return [
            'message' => $this->message
        ];
    }
}
