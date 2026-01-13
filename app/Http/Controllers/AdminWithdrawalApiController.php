<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\WithdrawalSettings;
use App\Models\WithdrawalRequest;
use App\Models\BalanceHistory;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class AdminWithdrawalApiController extends Controller
{
    /**
     * Get withdrawal settings
     */
    public function getSettings()
    {
        $settings = WithdrawalSettings::orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $settings,
        ]);
    }

    /**
     * Get active setting
     */
    public function getActiveSetting()
    {
        $setting = WithdrawalSettings::getActiveSetting();

        if (!$setting) {
            return response()->json([
                'success' => false,
                'message' => 'No active withdrawal setting found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $setting,
        ]);
    }

    /**
     * Store withdrawal settings
     */
    public function storeSettings(Request $request)
    {
        $data = $request->validate([
            'minimum_amount' => 'required|numeric|min:0.01',
            'maximum_amount' => 'nullable|numeric|min:0.01|gt:minimum_amount',
            'fee_percentage' => 'required|numeric|min:0|max:100',
            'fee_fixed' => 'required|numeric|min:0',
            'processing_days' => 'required|integer|min:0',
            'description' => 'nullable|string|max:500',
            'payment_methods' => 'required|array',
            'payment_methods.*' => 'string|in:bkash,nagad,rocket,bank',
            'is_active' => 'nullable|boolean',
        ]);

        // If this is set to active, deactivate all others
        if ($request->input('is_active', false)) {
            WithdrawalSettings::where('is_active', true)->update(['is_active' => false]);
        }

        $setting = WithdrawalSettings::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Withdrawal setting created successfully',
            'data' => $setting,
        ], 201);
    }

    /**
     * Update withdrawal settings
     */
    public function updateSettings(Request $request, WithdrawalSettings $withdrawalSetting)
    {
        $data = $request->validate([
            'minimum_amount' => 'sometimes|numeric|min:0.01',
            'maximum_amount' => 'nullable|numeric|min:0.01',
            'fee_percentage' => 'sometimes|numeric|min:0|max:100',
            'fee_fixed' => 'sometimes|numeric|min:0',
            'processing_days' => 'sometimes|integer|min:0',
            'description' => 'nullable|string|max:500',
            'payment_methods' => 'sometimes|array',
            'payment_methods.*' => 'string|in:bkash,nagad,rocket,bank',
            'is_active' => 'nullable|boolean',
        ]);

        // Validate maximum > minimum if both provided
        if (isset($data['maximum_amount']) && isset($data['minimum_amount'])) {
            if ($data['maximum_amount'] <= $data['minimum_amount']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Maximum amount must be greater than minimum amount',
                ], 400);
            }
        }

        // If this is set to active, deactivate all others
        if ($request->has('is_active') && $request->is_active) {
            WithdrawalSettings::where('is_active', true)
                ->where('id', '!=', $withdrawalSetting->id)
                ->update(['is_active' => false]);
        }

        $withdrawalSetting->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Withdrawal setting updated successfully',
            'data' => $withdrawalSetting->fresh(),
        ]);
    }

    /**
     * Delete withdrawal settings
     */
    public function deleteSettings(WithdrawalSettings $withdrawalSetting)
    {
        if ($withdrawalSetting->is_active) {
            $activeCount = WithdrawalSettings::where('is_active', true)->count();
            if ($activeCount <= 1) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete the only active setting',
                ], 400);
            }
        }

        $withdrawalSetting->delete();

        return response()->json([
            'success' => true,
            'message' => 'Withdrawal setting deleted successfully',
        ]);
    }

    /**
     * Toggle active status
     */
    public function toggleActiveSettings(WithdrawalSettings $withdrawalSetting)
    {
        if ($withdrawalSetting->is_active) {
            $withdrawalSetting->is_active = false;
            $withdrawalSetting->save();

            return response()->json([
                'success' => true,
                'message' => 'Withdrawal setting deactivated',
                'data' => $withdrawalSetting,
            ]);
        } else {
            DB::transaction(function () use ($withdrawalSetting) {
                WithdrawalSettings::where('is_active', true)->update(['is_active' => false]);
                $withdrawalSetting->is_active = true;
                $withdrawalSetting->save();
            });

            return response()->json([
                'success' => true,
                'message' => 'Withdrawal setting activated',
                'data' => $withdrawalSetting->fresh(),
            ]);
        }
    }

    /**
     * Get withdrawal requests with filters
     */
    public function getRequests(Request $request)
    {
        $query = WithdrawalRequest::with(['user:id,name,email', 'processedBy:id,name,email'])
            ->orderBy('created_at', 'desc');

        // Filters
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('payment_method') && $request->payment_method) {
            $query->where('payment_method', $request->payment_method);
        }

        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        if ($request->has('user_id') && $request->user_id) {
            $query->where('user_id', $request->user_id);
        }

        $perPage = $request->input('per_page', 50);
        $requests = $query->paginate($perPage);

        // Statistics
        $stats = [
            'total' => WithdrawalRequest::count(),
            'pending' => WithdrawalRequest::where('status', 'pending')->count(),
            'processing' => WithdrawalRequest::where('status', 'processing')->count(),
            'completed' => WithdrawalRequest::where('status', 'completed')->count(),
            'rejected' => WithdrawalRequest::where('status', 'rejected')->count(),
            'total_amount_pending' => WithdrawalRequest::where('status', 'pending')->sum('amount'),
            'total_amount_completed' => WithdrawalRequest::where('status', 'completed')->sum('amount'),
        ];

        return response()->json([
            'success' => true,
            'data' => $requests->items(),
            'pagination' => [
                'current_page' => $requests->currentPage(),
                'last_page' => $requests->lastPage(),
                'per_page' => $requests->perPage(),
                'total' => $requests->total(),
            ],
            'statistics' => $stats,
        ]);
    }

    /**
     * Get withdrawal request details
     */
    public function getRequestDetails($id)
    {
        $request = WithdrawalRequest::with(['user', 'processedBy'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $request,
        ]);
    }

    /**
     * Approve withdrawal request
     */
    public function approveRequest(Request $request, $id)
    {
        $request->validate([
            'admin_notes' => 'nullable|string|max:500',
        ]);

        $withdrawalRequest = WithdrawalRequest::findOrFail($id);

        if ($withdrawalRequest->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Only pending requests can be approved',
            ], 400);
        }

        $withdrawalRequest->status = 'approved';
        $withdrawalRequest->admin_notes = $request->input('admin_notes');
        $withdrawalRequest->processed_by = Auth::guard('admin')->id();
        $withdrawalRequest->processed_at = now();
        $withdrawalRequest->save();

        return response()->json([
            'success' => true,
            'message' => 'Withdrawal request approved',
            'data' => $withdrawalRequest->fresh(['user', 'processedBy']),
        ]);
    }

    /**
     * Reject withdrawal request
     */
    public function rejectRequest(Request $request, $id)
    {
        $request->validate([
            'admin_notes' => 'required|string|max:500',
        ]);

        $withdrawalRequest = WithdrawalRequest::findOrFail($id);

        if (!in_array($withdrawalRequest->status, ['pending', 'processing', 'approved'])) {
            return response()->json([
                'success' => false,
                'message' => 'Request cannot be rejected in current status',
            ], 400);
        }

        DB::beginTransaction();
        try {
            // Refund amount to user
            $user = $withdrawalRequest->user;
            $balanceBefore = $user->main_balance;
            $user->main_balance += $withdrawalRequest->amount;
            $user->save();

            // Update request status
            $withdrawalRequest->status = 'rejected';
            $withdrawalRequest->admin_notes = $request->admin_notes;
            $withdrawalRequest->processed_by = Auth::guard('admin')->id();
            $withdrawalRequest->processed_at = now();
            $withdrawalRequest->save();

            // Create balance history entry (refund)
            BalanceHistory::create([
                'user_id' => $user->id,
                'amount' => $withdrawalRequest->amount,
                'type' => 'credit',
                'source' => 'withdrawal_refund',
                'description' => "Rejected withdrawal request #{$withdrawalRequest->id} - Refund",
                'reference_id' => $withdrawalRequest->id,
                'reference_type' => 'WithdrawalRequest',
                'balance_before' => $balanceBefore,
                'balance_after' => $user->main_balance,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Withdrawal request rejected and amount refunded',
                'data' => $withdrawalRequest->fresh(['user', 'processedBy']),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to reject withdrawal request',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Mark withdrawal as completed
     */
    public function completeRequest(Request $request, $id)
    {
        $request->validate([
            'admin_notes' => 'nullable|string|max:500',
        ]);

        $withdrawalRequest = WithdrawalRequest::findOrFail($id);

        if (!in_array($withdrawalRequest->status, ['approved', 'processing'])) {
            return response()->json([
                'success' => false,
                'message' => 'Only approved or processing requests can be completed',
            ], 400);
        }

        $withdrawalRequest->status = 'completed';
        if ($request->has('admin_notes')) {
            $withdrawalRequest->admin_notes = $request->admin_notes;
        }
        if (!$withdrawalRequest->processed_by) {
            $withdrawalRequest->processed_by = Auth::guard('admin')->id();
        }
        if (!$withdrawalRequest->processed_at) {
            $withdrawalRequest->processed_at = now();
        }
        $withdrawalRequest->save();

        return response()->json([
            'success' => true,
            'message' => 'Withdrawal request marked as completed',
            'data' => $withdrawalRequest->fresh(['user', 'processedBy']),
        ]);
    }

    /**
     * Update request status
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,processing,approved,completed,rejected',
            'admin_notes' => 'nullable|string|max:500',
        ]);

        $withdrawalRequest = WithdrawalRequest::findOrFail($id);
        $oldStatus = $withdrawalRequest->status;
        $newStatus = $request->status;

        // If rejecting, refund the amount
        if ($newStatus === 'rejected' && in_array($oldStatus, ['pending', 'processing', 'approved'])) {
            DB::beginTransaction();
            try {
                $user = $withdrawalRequest->user;
                $balanceBefore = $user->main_balance;
                $user->main_balance += $withdrawalRequest->amount;
                $user->save();

                BalanceHistory::create([
                    'user_id' => $user->id,
                    'amount' => $withdrawalRequest->amount,
                    'type' => 'credit',
                    'source' => 'withdrawal_refund',
                    'description' => "Rejected withdrawal request #{$withdrawalRequest->id} - Refund",
                    'reference_id' => $withdrawalRequest->id,
                    'reference_type' => 'WithdrawalRequest',
                    'balance_before' => $balanceBefore,
                    'balance_after' => $user->main_balance,
                ]);

                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to update status',
                    'error' => $e->getMessage(),
                ], 500);
            }
        }

        $withdrawalRequest->status = $newStatus;
        if ($request->has('admin_notes')) {
            $withdrawalRequest->admin_notes = $request->admin_notes;
        }
        if (!$withdrawalRequest->processed_by) {
            $withdrawalRequest->processed_by = Auth::guard('admin')->id();
        }
        if (!$withdrawalRequest->processed_at) {
            $withdrawalRequest->processed_at = now();
        }
        $withdrawalRequest->save();

        return response()->json([
            'success' => true,
            'message' => 'Withdrawal request status updated',
            'data' => $withdrawalRequest->fresh(['user', 'processedBy']),
        ]);
    }
}
