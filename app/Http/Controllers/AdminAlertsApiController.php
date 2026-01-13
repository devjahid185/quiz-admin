<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\WithdrawalRequest;
use App\Models\CoinHistory;

class AdminAlertsApiController extends Controller
{
    /**
     * Return latest alert-worthy items for admin panel polling.
     */
    public function index(Request $request)
    {
        // Latest withdrawal request (any status)
        $latestWithdrawal = WithdrawalRequest::orderBy('id', 'desc')
            ->first(['id', 'amount', 'payment_method', 'status', 'created_at']);

        // Pending / processing withdrawal count
        $pendingWithdrawals = WithdrawalRequest::whereIn('status', ['pending', 'processing'])->count();

        // Latest registered user
        $latestUser = User::orderBy('id', 'desc')
            ->first(['id', 'name', 'email', 'created_at']);

        // New users today
        $newUsersToday = User::whereDate('created_at', today())->count();

        return response()->json([
            'success' => true,
            'latest' => [
                'withdrawal' => $latestWithdrawal,
                'user' => $latestUser,
            ],
            'counts' => [
                'pending_withdrawals' => $pendingWithdrawals,
                'new_users_today' => $newUsersToday,
            ],
        ]);
    }
}
