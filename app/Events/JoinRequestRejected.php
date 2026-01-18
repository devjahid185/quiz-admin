<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class JoinRequestRejected implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $roomCode;
    public $userId;
    public $requestId;

    public function __construct($roomCode, $userId, $requestId)
    {
        $this->roomCode = $roomCode;
        $this->userId = $userId;
        $this->requestId = $requestId;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('quiz.' . $this->roomCode),
            new Channel('user.' . $this->userId),
        ];
    }

    public function broadcastAs()
    {
        return 'JoinRequestRejected';
    }

    public function broadcastWith()
    {
        return [
            'room_code' => $this->roomCode,
            'user_id' => $this->userId,
            'request_id' => $this->requestId,
            'message' => 'Your join request has been rejected'
        ];
    }
}
