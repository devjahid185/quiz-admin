<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\CoinConversionSettings;
use App\Models\CoinHistory;
use App\Models\BalanceHistory;
use Illuminate\Support\Facades\DB;

class CoinConversionApiController extends Controller
{
    /**
     * Get conversion rate and settings
     */
    public function getConversionRate(Request $request)
    {
        $setting = CoinConversionSettings::getActiveSetting();

        if (!$setting) {
            return response()->json([
                'success' => false,
                'message' => 'Conversion service is currently unavailable',
            ], 503);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'coins_required' => $setting->coins_required,
                'main_balance_amount' => (float) $setting->main_balance_amount,
                'minimum_coins' => $setting->minimum_coins,
                'rate' => (float) $setting->rate, // coins per taka
                'description' => $setting->description,
            ],
        ]);
    }

    /**
     * Convert coins to main balance
     */
    public function convertCoins(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'coins' => 'required|integer|min:1',
        ]);

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        $setting = CoinConversionSettings::getActiveSetting();
        if (!$setting) {
            return response()->json([
                'success' => false,
                'message' => 'Conversion service is currently unavailable',
            ], 503);
        }

        // Check minimum coins requirement
        if ($request->coins < $setting->minimum_coins) {
            return response()->json([
                'success' => false,
                'message' => "Minimum {$setting->minimum_coins} coins required for conversion",
                'minimum_coins' => $setting->minimum_coins,
            ], 400);
        }

        // Check if user has enough coins
        if ($user->coin_balance < $request->coins) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient coin balance',
                'current_coin_balance' => $user->coin_balance,
                'required_coins' => $request->coins,
            ], 400);
        }

        // Calculate main balance to be added
        $mainBalanceToAdd = CoinConversionSettings::calculateMainBalance($request->coins);
        
        // Calculate actual coins to deduct (based on conversion rate)
        $actualCoinsToDeduct = floor($request->coins / $setting->coins_required) * $setting->coins_required;
        
        // Remaining coins that won't be converted
        $remainingCoins = $request->coins - $actualCoinsToDeduct;

        if ($actualCoinsToDeduct == 0) {
            return response()->json([
                'success' => false,
                'message' => "You need at least {$setting->coins_required} coins to convert",
                'coins_required' => $setting->coins_required,
            ], 400);
        }

        DB::beginTransaction();
        try {
            // Store balances before conversion
            $coinBalanceBefore = $user->coin_balance;
            $mainBalanceBefore = $user->main_balance;

            // Deduct coins
            $user->coin_balance -= $actualCoinsToDeduct;
            
            // Add main balance
            $user->main_balance += $mainBalanceToAdd;
            
            $user->save();

            // Create coin history entry (deduction)
            CoinHistory::create([
                'user_id' => $user->id,
                'coins' => -$actualCoinsToDeduct,
                'type' => 'spent',
                'source' => 'conversion',
                'description' => "Converted {$actualCoinsToDeduct} coins to ৳{$mainBalanceToAdd} main balance",
                'balance_before' => $coinBalanceBefore,
                'balance_after' => $user->coin_balance,
            ]);

            // Create balance history entry (main balance addition)
            BalanceHistory::create([
                'user_id' => $user->id,
                'amount' => $mainBalanceToAdd,
                'type' => 'credit',
                'source' => 'coin_conversion',
                'description' => "Converted {$actualCoinsToDeduct} coins to main balance",
                'reference_id' => null,
                'reference_type' => 'CoinConversion',
                'balance_before' => $mainBalanceBefore,
                'balance_after' => $user->main_balance,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Coins converted successfully',
                'data' => [
                    'coins_converted' => $actualCoinsToDeduct,
                    'coins_remaining' => $remainingCoins,
                    'main_balance_added' => (float) $mainBalanceToAdd,
                    'current_coin_balance' => $user->coin_balance,
                    'current_main_balance' => (float) $user->main_balance,
                    'conversion_rate' => [
                        'coins_required' => $setting->coins_required,
                        'main_balance_per_conversion' => (float) $setting->main_balance_amount,
                    ],
                ],
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Conversion failed. Please try again.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Preview conversion (calculate without converting)
     */
    public function previewConversion(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'coins' => 'required|integer|min:1',
        ]);

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        $setting = CoinConversionSettings::getActiveSetting();
        if (!$setting) {
            return response()->json([
                'success' => false,
                'message' => 'Conversion service is currently unavailable',
            ], 503);
        }

        // Check minimum coins
        if ($request->coins < $setting->minimum_coins) {
            return response()->json([
                'success' => false,
                'message' => "Minimum {$setting->minimum_coins} coins required",
                'minimum_coins' => $setting->minimum_coins,
            ], 400);
        }

        // Check if user has enough coins
        if ($user->coin_balance < $request->coins) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient coin balance',
                'current_coin_balance' => $user->coin_balance,
            ], 400);
        }

        // Calculate conversion
        $mainBalanceToAdd = CoinConversionSettings::calculateMainBalance($request->coins);
        $actualCoinsToDeduct = floor($request->coins / $setting->coins_required) * $setting->coins_required;
        $remainingCoins = $request->coins - $actualCoinsToDeduct;

        return response()->json([
            'success' => true,
            'data' => [
                'coins_to_convert' => $request->coins,
                'coins_will_be_deducted' => $actualCoinsToDeduct,
                'coins_remaining' => $remainingCoins,
                'main_balance_will_be_added' => (float) $mainBalanceToAdd,
                'current_coin_balance' => $user->coin_balance,
                'current_main_balance' => (float) $user->main_balance,
                'after_conversion' => [
                    'coin_balance' => $user->coin_balance - $actualCoinsToDeduct,
                    'main_balance' => (float) ($user->main_balance + $mainBalanceToAdd),
                ],
                'conversion_rate' => [
                    'coins_required' => $setting->coins_required,
                    'main_balance_per_conversion' => (float) $setting->main_balance_amount,
                ],
            ],
        ]);
    }
}
