<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserInvited implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $roomCode;
    public $invitedUserId;
    public $hostUser;
    public $roomId;
    public $invitationId;

    public function __construct($roomCode, $invitedUserId, $hostUser, $roomId, $invitationId)
    {
        $this->roomCode = $roomCode;
        $this->invitedUserId = $invitedUserId;
        $this->hostUser = $hostUser;
        $this->roomId = $roomId;
        $this->invitationId = $invitationId;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('user.' . $this->invitedUserId),
        ];
    }

    public function broadcastAs()
    {
        return 'UserInvited';
    }

    public function broadcastWith()
    {
        return [
            'room_code' => $this->roomCode,
            'room_id' => $this->roomId,
            'host' => [
                'id' => $this->hostUser->id,
                'name' => $this->hostUser->name,
                'image' => $this->hostUser->profile_image_url,
            ],
            'invitation_id' => $this->invitationId,
            'message' => 'You have been invited to join a game room'
        ];
    }
}
