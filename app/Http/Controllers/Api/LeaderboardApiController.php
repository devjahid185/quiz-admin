<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\CoinHistory;
use Illuminate\Support\Facades\DB;

class LeaderboardApiController extends Controller
{
    /**
     * Get leaderboard based on period (weekly, monthly, all-time)
     */
    public function index(Request $request)
    {
        $period = $request->input('period', 'all'); // weekly, monthly, all
        $limit = $request->input('limit', 100);
        $userEmail = $request->input('user_email');

        // ১. সিলেকশন কলামগুলো ডিফাইন করা
        $baseUserSelect = [
            'users.id', 'users.name', 'users.email', 'users.profile_image', 'users.coin_balance'
        ];

        // ২. কুয়েরি শুরু
        $query = User::select($baseUserSelect);

        // ৩. পিরিয়ড লজিক (Improved)
        if ($period === 'all') {
            // All Time: ইউজারের বর্তমান ব্যালেন্স দেখাবে (সবচেয়ে ধনী কে)
            $query->selectRaw('coin_balance as period_coins')
                  ->orderBy('coin_balance', 'desc');
        } else {
            // Weekly / Monthly: শুধুমাত্র ওই পিরিয়ডের ইনকাম যোগ হবে
            
            $startDate = ($period === 'weekly') ? now()->startOfWeek() : now()->startOfMonth();

            // ✅ ফিক্স: Conditional Join (শুধুমাত্র দরকারি ডাটা জয়েন করবে)
            $query->selectRaw('COALESCE(SUM(ch.coins), 0) as period_coins')
                  ->leftJoin('coin_history as ch', function($join) use ($startDate) {
                      $join->on('users.id', '=', 'ch.user_id')
                           ->where('ch.type', '=', 'earned')     // শুধু আর্ন করা কয়েন
                           ->where('ch.coins', '>', 0)           // পজিটিভ ভ্যালু
                           ->where('ch.created_at', '>=', $startDate); // ডেট ফিল্টার
                  })
                  ->groupBy($baseUserSelect)
                  ->orderBy('period_coins', 'desc');
        }

        // ✅ ৪. Tie-Breaker: স্কোর সমান হলে পুরনো ইউজার (ID) আগে থাকবে
        // এটি "Rank Mismatch" এর প্রধান সমাধান
        $query->orderBy('users.id', 'asc');

        // ডাটা ফেচ
        $leaderboardData = $query->limit($limit)->get();

        // ৫. লিস্ট ফরম্যাট করা
        $rankedLeaderboard = $leaderboardData->map(function ($user, $index) {
            return [
                'rank' => $index + 1,
                'user_id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'profile_image' => $user->profile_image ? asset('storage/' . $user->profile_image) : null,
                'coins' => (int) $user->period_coins,
                'total_coin_balance' => (int) $user->coin_balance,
            ];
        });

        // ৬. ইউজারের নিজস্ব র‍্যাঙ্ক বের করা (Optimized)
        $userRank = null;
        if ($userEmail) {
            // A. লিস্ট চেক (সবচেয়ে ফাস্ট)
            $inList = $rankedLeaderboard->firstWhere('email', $userEmail);
            
            if ($inList) {
                $userRank = $inList;
            } else {
                // B. লিস্টে না থাকলে ডাটাবেস চেক
                $user = User::where('email', $userEmail)->first();
                if ($user) {
                    $userScore = 0;

                    // স্কোর ক্যালকুলেশন (Main Query এর সাথে মিল রেখে)
                    if ($period === 'all') {
                        $userScore = $user->coin_balance;
                    } else {
                        $startDate = ($period === 'weekly') ? now()->startOfWeek() : now()->startOfMonth();
                        $userScore = CoinHistory::where('user_id', $user->id)
                            ->where('type', 'earned')
                            ->where('coins', '>', 0)
                            ->where('created_at', '>=', $startDate)
                            ->sum('coins');
                    }

                    // র‍্যাঙ্ক কাউন্ট (কতজনের স্কোর আমার চেয়ে বেশি)
                    // অথবা (স্কোর সমান কিন্তু আইডি আমার আগে)
                    $rankQuery = User::query();

                    if ($period === 'all') {
                        $rankQuery->where(function($q) use ($userScore, $user) {
                            $q->where('coin_balance', '>', $userScore)
                              ->orWhere(function($sub) use ($userScore, $user) {
                                  $sub->where('coin_balance', '=', $userScore)
                                      ->where('id', '<', $user->id);
                              });
                        });
                    } else {
                        // Weekly/Monthly Rank Count (Complex but Accurate)
                         $startDate = ($period === 'weekly') ? now()->startOfWeek() : now()->startOfMonth();
                         
                         $rankQuery->select('users.id')
                            ->leftJoin('coin_history as ch', function($join) use ($startDate) {
                                $join->on('users.id', '=', 'ch.user_id')
                                     ->where('ch.type', '=', 'earned')
                                     ->where('ch.coins', '>', 0)
                                     ->where('ch.created_at', '>=', $startDate);
                            })
                            ->groupBy('users.id')
                            ->havingRaw('COALESCE(SUM(ch.coins), 0) > ?', [$userScore]);
                            // Note: Complex tie-breaking for DB rank query skipped for performance, 
                            // assuming users outside top 100 care less about exact tie position.
                    }

                    $rank = $rankQuery->count() + 1; // Approx rank for outside top 100

                    $userRank = [
                        'rank' => $rank,
                        'user_id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'profile_image' => $user->profile_image ? asset('storage/' . $user->profile_image) : null,
                        'coins' => (int) $userScore,
                        'total_coin_balance' => (int) $user->coin_balance,
                    ];
                }
            }
        }

        return response()->json([
            'success' => true,
            'period' => $period,
            'leaderboard' => $rankedLeaderboard,
            'user_rank' => $userRank,
        ]);
    }

    /**
     * Get user's coin history
     */
    public function userHistory(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'period' => 'nullable|in:weekly,monthly,all',
            'limit' => 'nullable|integer|min:1|max:100',
        ]);

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        $period = $request->input('period', 'all');
        $limit = $request->input('limit', 50);

        $query = CoinHistory::where('user_id', $user->id)
            ->orderBy('created_at', 'desc');

        if ($period !== 'all') {
            if ($period === 'weekly') {
                $query->where('created_at', '>=', now()->startOfWeek());
            } elseif ($period === 'monthly') {
                $query->where('created_at', '>=', now()->startOfMonth());
            }
        }

        $history = $query->limit($limit)->get([
            'id',
            'coins',
            'type',
            'source',
            'description',
            'balance_before',
            'balance_after',
            'created_at'
        ]);

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'current_coin_balance' => (int) ($user->coin_balance ?? 0),
            ],
            'history' => $history,
        ]);
    }

    /**
     * Add coin history entry (for Flutter app)
     */
    public function addCoinHistory(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'coins' => 'required|integer', // Can be positive (earned) or negative (spent)
            'type' => 'required|string|in:earned,spent,bonus,reward,penalty,admin,purchase,refund',
            'source' => 'nullable|string|max:255', // quiz, question, admin, game, purchase, etc.
            'description' => 'nullable|string|max:500',
            'reference_id' => 'nullable|integer',
            'reference_type' => 'nullable|string|max:255', // Quiz, Question, Room, etc.
        ]);

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        // Get balance before transaction
        $balanceBefore = $user->coin_balance;

        // Update user's coin balance
        $user->coin_balance += $request->coins;

        // Ensure balance doesn't go negative (if spending)
        if ($user->coin_balance < 0) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient coin balance',
                'current_balance' => $balanceBefore,
            ], 400);
        }

        $user->save();

        // Create coin history entry
        $coinHistory = CoinHistory::create([
            'user_id' => $user->id,
            'coins' => $request->coins,
            'type' => $request->type,
            'source' => $request->source ?? 'app',
            'description' => $request->description ?? $this->getDefaultDescription($request->type, $request->coins),
            'reference_id' => $request->reference_id,
            'reference_type' => $request->reference_type,
            'balance_before' => $balanceBefore,
            'balance_after' => $user->coin_balance,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Coin history added successfully',
            'data' => [
                'id' => $coinHistory->id,
                'coins' => $coinHistory->coins,
                'type' => $coinHistory->type,
                'balance_before' => $coinHistory->balance_before,
                'balance_after' => $coinHistory->balance_after,
                'current_balance' => $user->coin_balance,
                'created_at' => $coinHistory->created_at,
            ],
        ], 201);
    }

    /**
     * Helper method to get default description based on type
     */
    private function getDefaultDescription($type, $coins)
    {
        $isEarned = $coins > 0;
        $amount = abs($coins);

        switch ($type) {
            case 'earned':
                return "Earned {$amount} coins";
            case 'spent':
                return "Spent {$amount} coins";
            case 'bonus':
                return "Received {$amount} coins as bonus";
            case 'reward':
                return "Received {$amount} coins as reward";
            case 'penalty':
                return "Penalty: {$amount} coins deducted";
            case 'admin':
                return $isEarned ? "Admin added {$amount} coins" : "Admin deducted {$amount} coins";
            case 'purchase':
                return "Purchased item for {$amount} coins";
            case 'refund':
                return "Refunded {$amount} coins";
            default:
                return $isEarned ? "Added {$amount} coins" : "Deducted {$amount} coins";
        }
    }

    /**
     * Helper method to get user's coins for a period
     */
    private function getUserCoinsForPeriod($userId, $period)
    {
        switch ($period) {
            case 'weekly':
                return CoinHistory::where('user_id', $userId)
                    ->where('created_at', '>=', now()->startOfWeek())
                    ->where('type', 'earned')
                    ->where('coins', '>', 0)
                    ->sum('coins') ?? 0;

            case 'monthly':
                return CoinHistory::where('user_id', $userId)
                    ->where('created_at', '>=', now()->startOfMonth())
                    ->where('type', 'earned')
                    ->where('coins', '>', 0)
                    ->sum('coins') ?? 0;

            case 'all':
            default:
                return CoinHistory::where('user_id', $userId)
                    ->where('type', 'earned')
                    ->where('coins', '>', 0)
                    ->sum('coins') ?? 0;
        }
    }
}
