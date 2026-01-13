<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\CoinHistory;
use Illuminate\Support\Facades\DB;

class AdminLeaderboardApiController extends Controller
{
    /**
     * Get leaderboard for admin panel (with more details)
     */
    public function index(Request $request)
    {
        $period = $request->input('period', 'all'); // weekly, monthly, all
        $limit = $request->input('limit', 100);
        $search = $request->input('search');

        $query = User::query();

        // Search filter
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('email', 'like', "%$search%");
            });
        }

        // Base select fields
        $baseUserSelect = ['users.id', 'users.name', 'users.email', 'users.profile_image', 'users.coin_balance', 'users.main_balance', 'users.blocked', 'users.created_at'];

        // Calculate total coins earned in the period
        switch ($period) {
            case 'weekly':
                $query->select($baseUserSelect)
                    ->selectRaw('COALESCE(SUM(CASE WHEN coin_history.created_at >= ? AND coin_history.type = "earned" AND coin_history.coins > 0 THEN coin_history.coins ELSE 0 END), 0) as period_coins', [now()->startOfWeek()])
                    ->leftJoin('coin_history', 'users.id', '=', 'coin_history.user_id')
                    ->groupBy($baseUserSelect)
                    ->orderBy('period_coins', 'desc');
                break;

            case 'monthly':
                $query->select($baseUserSelect)
                    ->selectRaw('COALESCE(SUM(CASE WHEN coin_history.created_at >= ? AND coin_history.type = "earned" AND coin_history.coins > 0 THEN coin_history.coins ELSE 0 END), 0) as period_coins', [now()->startOfMonth()])
                    ->leftJoin('coin_history', 'users.id', '=', 'coin_history.user_id')
                    ->groupBy($baseUserSelect)
                    ->orderBy('period_coins', 'desc');
                break;

            case 'all':
            default:
                $query->select($baseUserSelect)
                    ->selectRaw('COALESCE(SUM(CASE WHEN coin_history.type = "earned" AND coin_history.coins > 0 THEN coin_history.coins ELSE 0 END), 0) as period_coins')
                    ->leftJoin('coin_history', 'users.id', '=', 'coin_history.user_id')
                    ->groupBy($baseUserSelect)
                    ->orderBy('period_coins', 'desc');
                break;
        }

        $leaderboard = $query->limit($limit)->get();

        // Add rank and format data
        $rankedLeaderboard = $leaderboard->map(function ($user, $index) {
            return [
                'rank' => $index + 1,
                'user_id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'profile_image' => $user->profile_image ? asset('storage/' . $user->profile_image) : null,
                'period_coins' => (int) ($user->period_coins ?? 0),
                'total_coin_balance' => (int) ($user->coin_balance ?? 0),
                'main_balance' => (float) ($user->main_balance ?? 0),
                'blocked' => (bool) $user->blocked,
                'joined_at' => $user->created_at,
            ];
        });

        // Get statistics
        $stats = [
            'total_users' => User::count(),
            'total_coins_earned' => CoinHistory::where('type', 'earned')
                ->where('coins', '>', 0)
                ->when($period === 'weekly', fn($q) => $q->where('created_at', '>=', now()->startOfWeek()))
                ->when($period === 'monthly', fn($q) => $q->where('created_at', '>=', now()->startOfMonth()))
                ->sum('coins') ?? 0,
            'active_users' => User::where('blocked', false)->count(),
        ];

        return response()->json([
            'success' => true,
            'period' => $period,
            'leaderboard' => $rankedLeaderboard,
            'statistics' => $stats,
        ]);
    }

    /**
     * Get coin history for admin
     */
    public function coinHistory(Request $request)
    {
        $query = CoinHistory::with('user:id,name,email,profile_image')
            ->orderBy('created_at', 'desc');

        // Filters
        if ($request->has('user_id') && $request->user_id) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('type') && $request->type) {
            $query->where('type', $request->type);
        }

        if ($request->has('source') && $request->source) {
            $query->where('source', $request->source);
        }

        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $perPage = $request->input('per_page', 50);
        $history = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $history->items(),
            'pagination' => [
                'current_page' => $history->currentPage(),
                'last_page' => $history->lastPage(),
                'per_page' => $history->perPage(),
                'total' => $history->total(),
            ],
        ]);
    }
}
