<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class JoinRequestAccepted implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $roomCode;
    public $user;
    public $requestId;

    public function __construct($roomCode, $user, $requestId)
    {
        $this->roomCode = $roomCode;
        $this->user = $user;
        $this->requestId = $requestId;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('quiz.' . $this->roomCode),
            new Channel('user.' . $this->user->id),
        ];
    }

    public function broadcastAs()
    {
        return 'JoinRequestAccepted';
    }

    public function broadcastWith()
    {
        return [
            'room_code' => $this->roomCode,
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'image' => $this->user->profile_image_url,
            ],
            'request_id' => $this->requestId,
            'message' => 'Your join request has been accepted'
        ];
    }
}
