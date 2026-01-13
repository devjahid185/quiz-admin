<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\WithdrawalSettings;
use App\Models\WithdrawalRequest;
use App\Models\BalanceHistory;
use Illuminate\Support\Facades\DB;

class WithdrawalApiController extends Controller
{
    /**
     * Get withdrawal settings and calculate fee
     */
    public function getSettings(Request $request)
    {
        $setting = WithdrawalSettings::getActiveSetting();

        if (!$setting) {
            return response()->json([
                'success' => false,
                'message' => 'Withdrawal service is currently unavailable',
            ], 503);
        }

        $amount = $request->input('amount', 0);
        $fee = $amount > 0 ? $setting->calculateFee($amount) : 0;
        $netAmount = $amount > 0 ? $setting->calculateNetAmount($amount) : 0;

        return response()->json([
            'success' => true,
            'data' => [
                'minimum_amount' => (float) $setting->minimum_amount,
                'maximum_amount' => $setting->maximum_amount ? (float) $setting->maximum_amount : null,
                'fee_percentage' => (float) $setting->fee_percentage,
                'fee_fixed' => (float) $setting->fee_fixed,
                'processing_days' => $setting->processing_days,
                'payment_methods' => $setting->payment_methods ?? [],
                'fee_calculation' => $amount > 0 ? [
                    'amount' => (float) $amount,
                    'fee' => (float) $fee,
                    'net_amount' => (float) $netAmount,
                ] : null,
            ],
        ]);
    }

    /**
     * Calculate withdrawal fee (preview)
     */
    public function calculateFee(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.01',
        ]);

        $setting = WithdrawalSettings::getActiveSetting();
        if (!$setting) {
            return response()->json([
                'success' => false,
                'message' => 'Withdrawal service is currently unavailable',
            ], 503);
        }

        $validation = $setting->validateAmount($request->amount);
        if (!$validation['valid']) {
            return response()->json([
                'success' => false,
                'message' => $validation['message'],
            ], 400);
        }

        $fee = $setting->calculateFee($request->amount);
        $netAmount = $setting->calculateNetAmount($request->amount);

        return response()->json([
            'success' => true,
            'data' => [
                'amount' => (float) $request->amount,
                'fee' => (float) $fee,
                'net_amount' => (float) $netAmount,
                'fee_breakdown' => [
                    'percentage_fee' => (float) (($request->amount * $setting->fee_percentage) / 100),
                    'fixed_fee' => (float) $setting->fee_fixed,
                ],
            ],
        ]);
    }

    /**
     * Create withdrawal request
     */
    public function createRequest(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|string|in:bkash,nagad,rocket,bank',
            'account_number' => 'required|string|max:255',
            'account_name' => 'nullable|string|max:255',
            'bank_name' => 'nullable|string|max:255|required_if:payment_method,bank',
            'branch_name' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:500',
        ]);

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        $setting = WithdrawalSettings::getActiveSetting();
        if (!$setting) {
            return response()->json([
                'success' => false,
                'message' => 'Withdrawal service is currently unavailable',
            ], 503);
        }

        // Validate amount
        $validation = $setting->validateAmount($request->amount);
        if (!$validation['valid']) {
            return response()->json([
                'success' => false,
                'message' => $validation['message'],
            ], 400);
        }

        // Check if payment method is allowed
        $allowedMethods = $setting->payment_methods ?? [];
        if (!in_array($request->payment_method, $allowedMethods)) {
            return response()->json([
                'success' => false,
                'message' => 'Selected payment method is not available',
            ], 400);
        }

        // Calculate fee and net amount
        $fee = $setting->calculateFee($request->amount);
        $netAmount = $setting->calculateNetAmount($request->amount);

        // Check if user has sufficient balance
        if ($user->main_balance < $request->amount) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient balance',
                'current_balance' => (float) $user->main_balance,
                'required_amount' => (float) $request->amount,
            ], 400);
        }

        DB::beginTransaction();
        try {
            // Deduct amount from user balance
            $balanceBefore = $user->main_balance;
            $user->main_balance -= $request->amount;
            $user->save();

            // Create withdrawal request
            $withdrawalRequest = WithdrawalRequest::create([
                'user_id' => $user->id,
                'amount' => $request->amount,
                'fee' => $fee,
                'net_amount' => $netAmount,
                'payment_method' => $request->payment_method,
                'account_number' => $request->account_number,
                'account_name' => $request->account_name,
                'bank_name' => $request->bank_name,
                'branch_name' => $request->branch_name,
                'notes' => $request->notes,
                'status' => 'pending',
            ]);

            // Create balance history entry
            BalanceHistory::create([
                'user_id' => $user->id,
                'amount' => -$request->amount,
                'type' => 'debit',
                'source' => 'withdrawal',
                'description' => "Withdrawal request #{$withdrawalRequest->id} - {$request->payment_method}",
                'reference_id' => $withdrawalRequest->id,
                'reference_type' => 'WithdrawalRequest',
                'balance_before' => $balanceBefore,
                'balance_after' => $user->main_balance,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Withdrawal request created successfully',
                'data' => [
                    'request_id' => $withdrawalRequest->id,
                    'amount' => (float) $withdrawalRequest->amount,
                    'fee' => (float) $withdrawalRequest->fee,
                    'net_amount' => (float) $withdrawalRequest->net_amount,
                    'status' => $withdrawalRequest->status,
                    'current_balance' => (float) $user->main_balance,
                    'processing_days' => $setting->processing_days,
                ],
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create withdrawal request',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get user's withdrawal requests
     */
    public function getUserRequests(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'status' => 'nullable|in:pending,processing,approved,completed,rejected,cancelled',
            'limit' => 'nullable|integer|min:1|max:100',
        ]);

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        $query = WithdrawalRequest::where('user_id', $user->id)
            ->orderBy('created_at', 'desc');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $limit = $request->input('limit', 50);
        $requests = $query->limit($limit)->get([
            'id', 'amount', 'fee', 'net_amount', 'payment_method', 
            'account_number', 'status', 'created_at', 'processed_at', 'account_name', 'bank_name', 'branch_name', 'notes'
        ]);

        return response()->json([
            'success' => true,
            'data' => $requests,
        ]);
    }

    /**
     * Get withdrawal request details
     */
    public function getRequestDetails(Request $request, $id)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        $withdrawalRequest = WithdrawalRequest::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$withdrawalRequest) {
            return response()->json([
                'success' => false,
                'message' => 'Withdrawal request not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $withdrawalRequest,
        ]);
    }

    /**
     * Cancel withdrawal request (only if pending)
     */
    public function cancelRequest(Request $request, $id)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        $withdrawalRequest = WithdrawalRequest::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$withdrawalRequest) {
            return response()->json([
                'success' => false,
                'message' => 'Withdrawal request not found',
            ], 404);
        }

        if ($withdrawalRequest->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Only pending requests can be cancelled',
            ], 400);
        }

        DB::beginTransaction();
        try {
            // Refund amount to user
            $balanceBefore = $user->main_balance;
            $user->main_balance += $withdrawalRequest->amount;
            $user->save();

            // Update request status
            $withdrawalRequest->status = 'cancelled';
            $withdrawalRequest->save();

            // Create balance history entry (refund)
            BalanceHistory::create([
                'user_id' => $user->id,
                'amount' => $withdrawalRequest->amount,
                'type' => 'credit',
                'source' => 'withdrawal_refund',
                'description' => "Cancelled withdrawal request #{$withdrawalRequest->id} - Refund",
                'reference_id' => $withdrawalRequest->id,
                'reference_type' => 'WithdrawalRequest',
                'balance_before' => $balanceBefore,
                'balance_after' => $user->main_balance,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Withdrawal request cancelled successfully',
                'data' => [
                    'request_id' => $withdrawalRequest->id,
                    'refunded_amount' => (float) $withdrawalRequest->amount,
                    'current_balance' => (float) $user->main_balance,
                ],
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel withdrawal request',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get user's balance history
     */
    public function getBalanceHistory(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'period' => 'nullable|in:weekly,monthly,all',
            'type' => 'nullable|in:credit,debit,withdrawal,deposit,conversion,refund',
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
        $type = $request->input('type');
        $limit = $request->input('limit', 50);

        $query = BalanceHistory::where('user_id', $user->id)
            ->orderBy('created_at', 'desc');

        // Period filter
        if ($period !== 'all') {
            if ($period === 'weekly') {
                $query->where('created_at', '>=', now()->startOfWeek());
            } elseif ($period === 'monthly') {
                $query->where('created_at', '>=', now()->startOfMonth());
            }
        }

        // Type filter
        if ($type) {
            $query->where('type', $type);
        }

        $history = $query->limit($limit)->get([
            'id',
            'amount',
            'type',
            'source',
            'description',
            'balance_before',
            'balance_after',
            'created_at'
        ]);

        // Calculate summary
        $summary = [
            'total_credit' => BalanceHistory::where('user_id', $user->id)
                ->where('type', 'credit')
                ->when($period === 'weekly', fn($q) => $q->where('created_at', '>=', now()->startOfWeek()))
                ->when($period === 'monthly', fn($q) => $q->where('created_at', '>=', now()->startOfMonth()))
                ->sum('amount'),
            'total_debit' => abs(BalanceHistory::where('user_id', $user->id)
                ->where('type', 'debit')
                ->when($period === 'weekly', fn($q) => $q->where('created_at', '>=', now()->startOfWeek()))
                ->when($period === 'monthly', fn($q) => $q->where('created_at', '>=', now()->startOfMonth()))
                ->sum('amount')),
        ];

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'current_main_balance' => (float) ($user->main_balance ?? 0),
            ],
            'summary' => [
                'total_credit' => (float) $summary['total_credit'],
                'total_debit' => (float) $summary['total_debit'],
                'net_balance' => (float) ($summary['total_credit'] - $summary['total_debit']),
            ],
            'history' => $history,
        ]);
    }
}
