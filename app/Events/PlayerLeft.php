<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PlayerLeft implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $roomCode;
    public $userId;

    public function __construct($roomCode, $userId)
    {
        $this->roomCode = $roomCode;
        $this->userId = $userId;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('quiz.' . $this->roomCode),
        ];
    }

    public function broadcastAs()
    {
        return 'PlayerLeft';
    }
}