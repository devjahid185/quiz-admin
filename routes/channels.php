<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// ✅ আমাদের কুইজ রুম চ্যানেল
Broadcast::channel('quiz.{roomCode}', function ($user, $roomCode) {
    // এখানে আপনি চেক করতে পারেন ইউজার আসলেই এই রুমের প্লেয়ার কিনা
    // আপাতত আমরা সবাইকে এক্সেস দিচ্ছি এবং ইউজারের ইনফো রিটার্ন করছি
    return [
        'id' => $user->id,
        'name' => $user->name,
        'email' => $user->email
    ];
});

// ✅ User-specific notification channel (for invitations, request responses)
Broadcast::channel('user.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

// ✅ Chat channels
Broadcast::channel('chat.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

Broadcast::channel('conversation.{conversationId}', function ($user, $conversationId) {
    // Verify user is part of this conversation
    $conversation = \Illuminate\Support\Facades\DB::table('conversations')
        ->where('id', $conversationId)
        ->where(function($query) use ($user) {
            $query->where('user1_id', $user->id)
                  ->orWhere('user2_id', $user->id);
        })
        ->exists();
    
    return $conversation ? [
        'id' => $user->id,
        'name' => $user->name,
    ] : false;
});