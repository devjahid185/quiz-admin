<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Models\CoinHistory;
use App\Events\GameStarted;
use App\Events\PlayerJoined;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Models\Question;

class GameController extends Controller
{
    // ================= CREATE ROOM =================
    public function createRoom(Request $request)
    {
        $request->validate(['email' => 'required']);
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User not found']);
        }

        $roomCode = rand(100000, 999999);

        // 1. Create Room
        $roomId = DB::table('rooms')->insertGetId([
            'room_code' => $roomCode,
            'host_id' => $user->id,
            'status' => 'waiting',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 2. ✅✅ Host কেও Player হিসেবে add করা হলো
        DB::table('room_players')->insert([
            'room_id' => $roomId,
            'user_id' => $user->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 3. হোস্টের ডাটা রেডি করা (Flutter এ দেখানোর জন্য)
        $hostData = [
            'id' => $user->id,
            'name' => $user->name,
            'image' => $user->profile_image_url, // আপনার মডেলে appends থাকতে হবে
            'email' => $user->email
        ];

        return response()->json([
            'success' => true,
            'room_code' => $roomCode,
            'room_id' => $roomId,
            'players' => [$hostData], // ✅ হোস্টকে প্লেয়ার লিস্টে পাঠানো হলো
            'message' => 'Room created successfully'
        ]);
    }

    // ================= JOIN ROOM =================
    public function joinRoom(Request $request)
    {
        $request->validate([
            'email' => 'required',
            'room_code' => 'required'
        ]);

        $user = User::where('email', $request->email)->first();
        $room = DB::table('rooms')->where('room_code', $request->room_code)->first();

        if (!$room) {
            return response()->json(['success' => false, 'message' => 'Invalid Room Code'], 404);
        }

        // Check if already joined
        $exists = DB::table('room_players')
            ->where('room_id', $room->id)
            ->where('user_id', $user->id)
            ->exists();

        if (!$exists) {
            DB::table('room_players')->insert([
                'room_id' => $room->id,
                'user_id' => $user->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // 🔥 Notify others via WebSocket
            broadcast(new PlayerJoined($request->room_code, $user))->toOthers();
        }

        // ✅✅ বর্তমানে রুমে যারা আছে তাদের লিস্ট বের করা (যাতে নতুন জয়েন করা ইউজার সবাইকে দেখে)
        // আমরা Eloquent ব্যবহার করছি যাতে profile_image_url অটোমেটিক আসে
        $currentPlayers = User::join('room_players', 'users.id', '=', 'room_players.user_id')
            ->where('room_players.room_id', $room->id)
            ->select('users.*') // সব ইউজার ডাটা
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Joined room successfully',
            'room_code' => $request->room_code,
            'players' => $currentPlayers, // ✅ সব প্লেয়ারের লিস্ট পাঠানো হলো
        ]);
    }

    // ================= LEAVE ROOM (নিজে বের হয়ে যাওয়া) =================
    public function leaveRoom(Request $request)
    {
        $request->validate([
            'email' => 'required',
            'room_code' => 'required'
        ]);

        $user = User::where('email', $request->email)->first();
        $room = DB::table('rooms')->where('room_code', $request->room_code)->first();

        if ($user && $room) {
            // প্লেয়ার ডিলিট করা
            DB::table('room_players')
                ->where('room_id', $room->id)
                ->where('user_id', $user->id)
                ->delete();

            // সবাইকে জানানো
            broadcast(new \App\Events\PlayerLeft($request->room_code, $user->id))->toOthers();
        }

        return response()->json(['success' => true, 'message' => 'Left room']);
    }

    // ================= KICK PLAYER (হোস্ট বের করে দিবে) =================
    public function kickPlayer(Request $request)
    {
        $request->validate([
            'host_email' => 'required', // যে রিকোয়েস্ট করছে (হোস্ট)
            'room_code' => 'required',
            'player_id' => 'required' // যাকে বের করা হবে
        ]);

        $host = User::where('email', $request->host_email)->first();
        $room = DB::table('rooms')->where('room_code', $request->room_code)->first();

        // ভেরিফিকেশন: রিকোয়েস্টকারী কি আসলেই হোস্ট?
        if ($room && $room->host_id == $host->id) {
            
            // প্লেয়ার ডিলিট করা
            DB::table('room_players')
                ->where('room_id', $room->id)
                ->where('user_id', $request->player_id)
                ->delete();

            // সবাইকে জানানো (যাতে UI আপডেট হয়)
            broadcast(new \App\Events\PlayerLeft($request->room_code, $request->player_id))->toOthers();

            return response()->json(['success' => true, 'message' => 'Player kicked']);
        }

        return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
    }

    // ================= START GAME =================
    public function startGame(Request $request)
    {
        $request->validate(['room_code' => 'required']);

        // ১. রুম স্ট্যাটাস আপডেট
        DB::table('rooms')
            ->where('room_code', $request->room_code)
            ->update(['status' => 'playing']);

        // ২. ৫টি র‍্যান্ডম প্রশ্ন সিলেক্ট করা
        $questions = Question::inRandomOrder()->limit(10)->get();

        // ৩. সবার কাছে প্রশ্ন পাঠিয়ে দেওয়া
        broadcast(new GameStarted($request->room_code, $questions))->toOthers();

        return response()->json(['success' => true, 'questions' => $questions]);
    }

    // ================= SUBMIT ANSWER =================
    public function submitAnswer(Request $request)
    {
        $request->validate([
            'email' => 'required',
            'room_code' => 'required',
            'question_id' => 'required',
            'selected_option' => 'required' // a, b, c, d
        ]);

        $user = User::where('email', $request->email)->first();
        $question = Question::find($request->question_id);

        $isCorrect = false;
        $coinsEarned = 0;

        // উত্তর চেক করা
        if ($question && $question->correct_option == $request->selected_option) {
            $isCorrect = true;
            $coinsEarned = $question->points ?? 10; // Default 10 if points not set

            // ১. Balance before transaction
            $balanceBefore = $user->coin_balance;

            // ২. ইউজারের মেইন ব্যালেন্স আপডেট (Coin Update)
            $user->coin_balance += $coinsEarned;
            $user->save();

            // ৩. Coin History Save
            CoinHistory::create([
                'user_id' => $user->id,
                'coins' => $coinsEarned,
                'type' => 'earned',
                'source' => 'quiz',
                'description' => 'Earned from answering question correctly',
                'reference_id' => $question->id,
                'reference_type' => 'Question',
                'balance_before' => $balanceBefore,
                'balance_after' => $user->coin_balance,
            ]);

            // ৪. রুমের স্কোর আপডেট (Leaderboard এর জন্য)
            DB::table('room_players')
                ->where('user_id', $user->id)
                ->increment('score', $coinsEarned);
        }

        return response()->json([
            'success' => true,
            'is_correct' => $isCorrect,
            'earned_coins' => $coinsEarned,
            'current_balance' => $user->coin_balance
        ]);
    }
}