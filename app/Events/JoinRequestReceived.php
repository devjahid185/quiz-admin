<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class JoinRequestReceived implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $roomCode;
    public $requestData;

    public function __construct($roomCode, $requestData)
    {
        $this->roomCode = $roomCode;
        $this->requestData = $requestData;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('quiz.' . $this->roomCode),
        ];
    }

    public function broadcastAs()
    {
        return 'JoinRequestReceived';
    }

    public function broadcastWith()
    {
        return [
            'request' => $this->requestData
        ];
    }
}
