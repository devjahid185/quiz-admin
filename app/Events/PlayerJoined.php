<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PlayerJoined implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $roomCode;
    public $user;

    public function __construct($roomCode, $user)
    {
        $this->roomCode = $roomCode;
        $this->user = $user;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('quiz.' . $this->roomCode),
        ];
    }

    // ✅✅ ইভেন্টের নাম সহজ করার জন্য
    public function broadcastAs()
    {
        return 'PlayerJoined';
    }

    public function broadcastWith()
    {
        return [
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'image' => $this->user->profile_image_url,
            ]
        ];
    }
}