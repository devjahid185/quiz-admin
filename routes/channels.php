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