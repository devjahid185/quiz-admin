<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class GameStarted implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $roomCode;
    public $questions; // প্রশ্নগুলো এখানে থাকবে

    public function __construct($roomCode, $questions)
    {
        $this->roomCode = $roomCode;
        $this->questions = $questions;
    }

    public function broadcastOn(): array
    {
        return [new Channel('quiz.' . $this->roomCode)];
    }

    public function broadcastAs()
    {
        return 'GameStarted';
    }
}
