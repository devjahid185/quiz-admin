<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Models\CoinHistory;
use App\Events\GameStarted;
use App\Events\PlayerJoined;
use App\Events\JoinRequestReceived;
use App\Events\JoinRequestAccepted;
use App\Events\JoinRequestRejected;
use App\Events\UserInvited;
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

        // 1. Create Room with approval requirement
        $roomId = DB::table('rooms')->insertGetId([
            'room_code' => $roomCode,
            'host_id' => $user->id,
            'status' => 'waiting',
            'requires_approval' => true, // ✅ Host rooms require approval
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
    // ================= JOIN ROOM (FIXED) =================
    public function joinRoom(Request $request)
    {
        $request->validate([
            'email' => 'required',
            'room_code' => 'required'
        ]);

        $user = User::where('email', $request->email)->first();
        $room = DB::table('rooms')->where('room_code', $request->room_code)->first();

        if (!$room) return response()->json(['success' => false, 'message' => 'Invalid Room Code'], 404);

        // ✅ FIX: আগেই জয়েন করা থাকলে সরাসরি রিটার্ন করুন
        $alreadyJoined = DB::table('room_players')
            ->where('room_id', $room->id)
            ->where('user_id', $user->id)
            ->exists();

        if ($alreadyJoined) {
            // আগেই জয়েন থাকলে helper মেথড দিয়ে সব প্লেয়ার লিস্ট রিটার্ন করুন
            return $this->returnSuccessResponse($room->room_code, $room->id, 'Rejoined room successfully');
        }

        // Approval Check
        if ($room->requires_approval) {
            $isInvited = DB::table('room_join_requests')
                ->where('room_id', $room->id)
                ->where('user_id', $user->id)
                ->whereIn('status', ['invited', 'accepted']) // invited বা accepted দুটোই চেক করা ভালো
                ->exists();

            if (!$isInvited) {
                return response()->json([
                    'success' => false,
                    'message' => 'Approval required',
                    'requires_approval' => true
                ]);
            }
        }

        // Add to room_players
        DB::table('room_players')->insert([
            'room_id' => $room->id, 'user_id' => $user->id, 'created_at' => now(), 'updated_at' => now()
        ]);
        
        // ক্লিনআপ: ইনভাইটেশন থাকলে মুছে দিন
        DB::table('room_join_requests')->where('room_id', $room->id)->where('user_id', $user->id)->delete();

        // 🔥 Notify others via WebSocket
        $user->image = $user->profile_image ? asset('storage/' . $user->profile_image) : null;
        broadcast(new PlayerJoined($request->room_code, $user))->toOthers();

        // ✅✅ MAIN FIX: এখানে returnSuccessResponse কল করা হচ্ছে যা সব প্লেয়ার রিটার্ন করে
        return $this->returnSuccessResponse($request->room_code, $room->id, 'Joined room successfully');
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

    // ================= REQUEST TO JOIN ROOM =================
    public function requestToJoin(Request $request)
    {
        $request->validate([
            'email' => 'required',
            'room_code' => 'required'
        ]);

        $user = User::where('email', $request->email)->first();
        $room = DB::table('rooms')->where('room_code', $request->room_code)->first();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User not found'], 404);
        }

        if (!$room) {
            return response()->json(['success' => false, 'message' => 'Invalid Room Code'], 404);
        }

        // Check if already in room
        $alreadyJoined = DB::table('room_players')
            ->where('room_id', $room->id)
            ->where('user_id', $user->id)
            ->exists();

        if ($alreadyJoined) {
            return response()->json(['success' => false, 'message' => 'You are already in this room']);
        }

        // Check if already has pending request
        $pendingRequest = DB::table('room_join_requests')
            ->where('room_id', $room->id)
            ->where('user_id', $user->id)
            ->where('status', 'pending')
            ->exists();

        if ($pendingRequest) {
            return response()->json(['success' => false, 'message' => 'You already have a pending request for this room']);
        }

        // Create join request
        $requestId = DB::table('room_join_requests')->insertGetId([
            'room_id' => $room->id,
            'user_id' => $user->id,
            'status' => 'pending',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Prepare request data for notification
        $requestData = [
            'id' => $requestId,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'image' => $user->profile_image_url,
            ],
            'room_code' => $room->room_code,
            'created_at' => now()->toISOString()
        ];

        // ✅ Get all current players in room (in case user needs this info)
        $currentPlayers = User::join('room_players', 'users.id', '=', 'room_players.user_id')
            ->where('room_players.room_id', $room->id)
            ->select('users.*')
            ->get();

        // Notify host via WebSocket
        broadcast(new JoinRequestReceived($room->room_code, $requestData))->toOthers();

        return response()->json([
            'success' => true,
            'message' => 'Join request sent successfully',
            'request_id' => $requestId,
            // ✅ Return all current players (useful if needed)
            'players' => $currentPlayers
        ]);
    }

    // ================= GET PENDING REQUESTS (For Host) =================
    public function getPendingRequests(Request $request)
    {
        $request->validate([
            'host_email' => 'required',
            'room_code' => 'required'
        ]);

        $host = User::where('email', $request->host_email)->first();
        $room = DB::table('rooms')->where('room_code', $request->room_code)->first();

        if (!$host || !$room) {
            return response()->json(['success' => false, 'message' => 'Invalid data'], 404);
        }

        // Verify host
        if ($room->host_id != $host->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized. Only host can view requests'], 403);
        }

        // Get pending requests with user details (exclude invitations from host)
        $pendingRequests = DB::table('room_join_requests')
            ->join('users', 'room_join_requests.user_id', '=', 'users.id')
            ->where('room_join_requests.room_id', $room->id)
            ->where('room_join_requests.status', 'pending')
            ->where('room_join_requests.invited_by_host', false) // ✅ Exclude invitations
            ->select(
                'room_join_requests.id as request_id',
                'room_join_requests.created_at as requested_at',
                'users.id',
                'users.name',
                'users.email',
                'users.phone_number',
                'users.profile_image',
                'users.is_online'
            )
            ->orderBy('room_join_requests.created_at', 'desc')
            ->get();

        // Format response with profile_image_url
        $formattedRequests = $pendingRequests->map(function ($req) {
            return [
                'request_id' => $req->request_id,
                'requested_at' => $req->requested_at,
                'user' => [
                    'id' => $req->id,
                    'name' => $req->name,
                    'email' => $req->email,
                    'phone_number' => $req->phone_number,
                    'image' => $req->profile_image ? asset('storage/' . $req->profile_image) : null,
                    'is_online' => $req->is_online ?? false,
                ]
            ];
        });

        return response()->json([
            'success' => true,
            'pending_requests' => $formattedRequests
        ]);
    }

    // ================= ACCEPT JOIN REQUEST =================
    public function acceptRequest(Request $request)
    {
        $request->validate([
            'host_email' => 'required',
            'room_code' => 'required',
            'request_id' => 'required'
        ]);

        $host = User::where('email', $request->host_email)->first();
        $room = DB::table('rooms')->where('room_code', $request->room_code)->first();
        $joinRequest = DB::table('room_join_requests')
            ->where('id', $request->request_id)
            ->first();

        if (!$host || !$room || !$joinRequest) {
            return response()->json(['success' => false, 'message' => 'Invalid data'], 404);
        }

        // Verify host
        if ($room->host_id != $host->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        // Verify request belongs to this room
        if ($joinRequest->room_id != $room->id || $joinRequest->status != 'pending') {
            return response()->json(['success' => false, 'message' => 'Invalid request'], 400);
        }

        // Update request status
        DB::table('room_join_requests')
            ->where('id', $request->request_id)
            ->update(['status' => 'accepted', 'updated_at' => now()]);

        // Add user to room players
        DB::table('room_players')->insert([
            'room_id' => $room->id,
            'user_id' => $joinRequest->user_id,
            'status' => 'approved',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Get user data
        $user = User::find($joinRequest->user_id);

        // ✅ Get all current players in room (so the accepted user can see everyone)
        $currentPlayers = User::join('room_players', 'users.id', '=', 'room_players.user_id')
            ->where('room_players.room_id', $room->id)
            ->select('users.*')
            ->get();

        // Notify via WebSocket
        broadcast(new JoinRequestAccepted($room->room_code, $user, $request->request_id))->toOthers();
        broadcast(new PlayerJoined($room->room_code, $user))->toOthers();

        return response()->json([
            'success' => true,
            'message' => 'Join request accepted successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'image' => $user->profile_image_url,
            ],
            // ✅ Return all players so the accepted user sees everyone in lobby
            'players' => $currentPlayers
        ]);
    }

    // ================= REJECT JOIN REQUEST =================
    public function rejectRequest(Request $request)
    {
        $request->validate([
            'host_email' => 'required',
            'room_code' => 'required',
            'request_id' => 'required'
        ]);

        $host = User::where('email', $request->host_email)->first();
        $room = DB::table('rooms')->where('room_code', $request->room_code)->first();
        $joinRequest = DB::table('room_join_requests')
            ->where('id', $request->request_id)
            ->first();

        if (!$host || !$room || !$joinRequest) {
            return response()->json(['success' => false, 'message' => 'Invalid data'], 404);
        }

        // Verify host
        if ($room->host_id != $host->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        // Verify request belongs to this room
        if ($joinRequest->room_id != $room->id || $joinRequest->status != 'pending') {
            return response()->json(['success' => false, 'message' => 'Invalid request'], 400);
        }

        // Update request status
        DB::table('room_join_requests')
            ->where('id', $request->request_id)
            ->update(['status' => 'rejected', 'updated_at' => now()]);

        // Notify via WebSocket
        broadcast(new JoinRequestRejected($room->room_code, $joinRequest->user_id, $request->request_id))->toOthers();

        return response()->json([
            'success' => true,
            'message' => 'Join request rejected'
        ]);
    }

    // ================= GET ALL USERS (For Host to Invite) =================
    public function getAllUsers(Request $request)
    {
        $request->validate([
            'host_email' => 'required',
            'room_code' => 'required'
        ]);

        $host = User::where('email', $request->host_email)->first();
        $room = DB::table('rooms')->where('room_code', $request->room_code)->first();

        if (!$host || !$room) {
            return response()->json(['success' => false, 'message' => 'Invalid data'], 404);
        }

        // Verify host
        if ($room->host_id != $host->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        // Get users already in room
        $roomPlayerIds = DB::table('room_players')
            ->where('room_id', $room->id)
            ->pluck('user_id')
            ->toArray();

        // Get all users except host and those already in room
        $users = User::where('id', '!=', $host->id)
            ->whereNotIn('id', $roomPlayerIds)
            ->where('blocked', false)
            ->select('id', 'name', 'email', 'phone_number', 'profile_image', 'is_online', 'last_seen_at')
            ->orderBy('is_online', 'desc')
            ->orderBy('name', 'asc')
            ->get();

        // Format response
        $formattedUsers = $users->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone_number' => $user->phone_number,
                'image' => $user->profile_image ? asset('storage/' . $user->profile_image) : null,
                'is_online' => $user->is_online ?? false,
                'last_seen_at' => $user->last_seen_at,
            ];
        });

        return response()->json([
            'success' => true,
            'users' => $formattedUsers,
            'total_count' => $formattedUsers->count()
        ]);
    }

    // ================= SEARCH USERS BY PHONE NUMBER =================
    public function searchUsersByPhone(Request $request)
    {
        $request->validate([
            'host_email' => 'required',
            'room_code' => 'required',
            'phone_number' => 'required|string'
        ]);

        $host = User::where('email', $request->host_email)->first();
        $room = DB::table('rooms')->where('room_code', $request->room_code)->first();

        if (!$host || !$room) {
            return response()->json(['success' => false, 'message' => 'Invalid data'], 404);
        }

        // Verify host
        if ($room->host_id != $host->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        // Get users already in room
        $roomPlayerIds = DB::table('room_players')
            ->where('room_id', $room->id)
            ->pluck('user_id')
            ->toArray();

        // Search users by phone number
        $phoneSearch = '%' . $request->phone_number . '%';
        $users = User::where('id', '!=', $host->id)
            ->whereNotIn('id', $roomPlayerIds)
            ->where('blocked', false)
            ->where('phone_number', 'LIKE', $phoneSearch)
            ->select('id', 'name', 'email', 'phone_number', 'profile_image', 'is_online', 'last_seen_at')
            ->orderBy('is_online', 'desc')
            ->orderBy('name', 'asc')
            ->limit(20)
            ->get();

        // Format response
        $formattedUsers = $users->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone_number' => $user->phone_number,
                'image' => $user->profile_image ? asset('storage/' . $user->profile_image) : null,
                'is_online' => $user->is_online ?? false,
                'last_seen_at' => $user->last_seen_at,
            ];
        });

        return response()->json([
            'success' => true,
            'users' => $formattedUsers,
            'total_count' => $formattedUsers->count()
        ]);
    }

    // ================= INVITE USER TO ROOM =================
    public function inviteUser(Request $request)
    {
        $request->validate([
            'host_email' => 'required',
            'room_code' => 'required',
            'user_id' => 'required|integer'
        ]);

        $host = User::where('email', $request->host_email)->first();
        $room = DB::table('rooms')->where('room_code', $request->room_code)->first();
        $invitedUser = User::find($request->user_id);

        if (!$host || !$room || !$invitedUser) {
            return response()->json(['success' => false, 'message' => 'Invalid data'], 404);
        }

        // Verify host
        if ($room->host_id != $host->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        // Check if user is already in room
        $alreadyJoined = DB::table('room_players')
            ->where('room_id', $room->id)
            ->where('user_id', $invitedUser->id)
            ->exists();

        if ($alreadyJoined) {
            return response()->json(['success' => false, 'message' => 'User is already in this room']);
        }

        // Check if invitation already exists
        $existingInvitation = DB::table('room_join_requests')
            ->where('room_id', $room->id)
            ->where('user_id', $invitedUser->id)
            ->where('invited_by_host', true)
            ->where('status', 'pending')
            ->exists();

        if ($existingInvitation) {
            return response()->json(['success' => false, 'message' => 'Invitation already sent to this user']);
        }

        // ✅ Create invitation (NOT auto-add to room - user must accept)
        $invitationId = DB::table('room_join_requests')->insertGetId([
            'room_id' => $room->id,
            'user_id' => $invitedUser->id,
            'status' => 'pending',
            'invited_by_host' => true, // ✅ Mark as invitation from host
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // ✅ Notify invited user via WebSocket (user-specific channel)
        broadcast(new UserInvited($room->room_code, $invitedUser->id, $host, $room->id, $invitationId));

        return response()->json([
            'success' => true,
            'message' => 'Invitation sent successfully. User will see the invitation and can accept it.',
            'invitation_id' => $invitationId,
            'invited_user' => [
                'id' => $invitedUser->id,
                'name' => $invitedUser->name,
                'image' => $invitedUser->profile_image_url,
            ]
        ]);
    }

    // ================= GET USER INVITATIONS =================
    public function getUserInvitations(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User not found'], 404);
        }

        // Get pending invitations for this user
        $invitations = DB::table('room_join_requests')
            ->join('rooms', 'room_join_requests.room_id', '=', 'rooms.id')
            ->join('users as hosts', 'rooms.host_id', '=', 'hosts.id')
            ->where('room_join_requests.user_id', $user->id)
            ->where('room_join_requests.status', 'pending')
            ->where('room_join_requests.invited_by_host', true) // Only invitations
            ->select(
                'room_join_requests.id as invitation_id',
                'room_join_requests.created_at as invited_at',
                'rooms.id as room_id',
                'rooms.room_code',
                'rooms.status as room_status',
                'hosts.id as host_id',
                'hosts.name as host_name',
                'hosts.email as host_email',
                'hosts.profile_image as host_image'
            )
            ->orderBy('room_join_requests.created_at', 'desc')
            ->get();

        // Format response
        $formattedInvitations = $invitations->map(function ($inv) {
            return [
                'invitation_id' => $inv->invitation_id,
                'invited_at' => $inv->invited_at,
                'room' => [
                    'id' => $inv->room_id,
                    'room_code' => $inv->room_code,
                    'status' => $inv->room_status,
                ],
                'host' => [
                    'id' => $inv->host_id,
                    'name' => $inv->host_name,
                    'email' => $inv->host_email,
                    'image' => $inv->host_image ? asset('storage/' . $inv->host_image) : null,
                ]
            ];
        });

        return response()->json([
            'success' => true,
            'invitations' => $formattedInvitations,
            'total_count' => $formattedInvitations->count()
        ]);
    }

    // ================= ACCEPT INVITATION =================
    public function acceptInvitation(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'invitation_id' => 'required|integer'
        ]);

        $user = User::where('email', $request->email)->first();
        $invitation = DB::table('room_join_requests')->where('id', $request->invitation_id)->first();

        if (!$user || !$invitation) {
            return response()->json(['success' => false, 'message' => 'Invalid data'], 404);
        }

        $room = DB::table('rooms')->where('id', $invitation->room_id)->first();

        // 1. Update Invitation Status
        DB::table('room_join_requests')
            ->where('id', $request->invitation_id)
            ->update(['status' => 'accepted', 'updated_at' => now()]);

        // 2. Add to Room Players (if not exists)
        $exists = DB::table('room_players')->where('room_id', $room->id)->where('user_id', $user->id)->exists();
        if (!$exists) {
            DB::table('room_players')->insert([
                'room_id' => $room->id, 'user_id' => $user->id, 'status' => 'approved', 'created_at' => now(), 'updated_at' => now()
            ]);
            
            // Notify others
            $user->image = $user->profile_image ? asset('storage/' . $user->profile_image) : null;
            broadcast(new PlayerJoined($room->room_code, $user))->toOthers();
        }

        return $this->returnSuccessResponse($room->room_code, $room->id, 'Invitation accepted');
    }

    // ✅✅ HELPER FUNCTION: সব প্লেয়ার লিস্ট রিটার্ন করার জন্য
    private function returnSuccessResponse($roomCode, $roomId, $message)
    {
        // হোস্ট সহ সব প্লেয়ার ফেচ করা
        $currentPlayers = User::join('room_players', 'users.id', '=', 'room_players.user_id')
            ->where('room_players.room_id', $roomId)
            ->select('users.id', 'users.name', 'users.email', 'users.profile_image')
            ->get()
            ->map(function($u) {
                // ইমেজ URL ফরম্যাট করা
                $u->image = $u->profile_image ? asset('storage/' . $u->profile_image) : null;
                return $u;
            });

        return response()->json([
            'success' => true,
            'message' => $message,
            'room_code' => $roomCode,
            'players' => $currentPlayers // ✅ এই লিস্ট ফ্লাটারে পাঠানো হচ্ছে
        ]);
    }
}
