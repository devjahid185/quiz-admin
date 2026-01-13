<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CoinConversionSettings;
use Illuminate\Support\Facades\DB;

class AdminCoinConversionApiController extends Controller
{
    /**
     * Get conversion settings
     */
    public function index()
    {
        $settings = CoinConversionSettings::orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $settings,
        ]);
    }

    /**
     * Get active setting
     */
    public function getActive()
    {
        $setting = CoinConversionSettings::getActiveSetting();

        if (!$setting) {
            return response()->json([
                'success' => false,
                'message' => 'No active conversion setting found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $setting,
        ]);
    }

    /**
     * Store new conversion setting
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'coins_required' => 'required|integer|min:1',
            'main_balance_amount' => 'required|numeric|min:0.01',
            'minimum_coins' => 'required|integer|min:1',
            'description' => 'nullable|string|max:500',
            'is_active' => 'nullable|boolean',
        ]);

        // If this is set to active, deactivate all others
        if ($request->input('is_active', false)) {
            CoinConversionSettings::where('is_active', true)->update(['is_active' => false]);
        }

        $setting = CoinConversionSettings::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Conversion setting created successfully',
            'data' => $setting,
        ], 201);
    }

    /**
     * Update conversion setting
     */
    public function update(Request $request, CoinConversionSettings $coinConversionSetting)
    {
        $data = $request->validate([
            'coins_required' => 'sometimes|integer|min:1',
            'main_balance_amount' => 'sometimes|numeric|min:0.01',
            'minimum_coins' => 'sometimes|integer|min:1',
            'description' => 'nullable|string|max:500',
            'is_active' => 'nullable|boolean',
        ]);

        // If this is set to active, deactivate all others
        if ($request->has('is_active') && $request->is_active) {
            CoinConversionSettings::where('is_active', true)
                ->where('id', '!=', $coinConversionSetting->id)
                ->update(['is_active' => false]);
        }

        $coinConversionSetting->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Conversion setting updated successfully',
            'data' => $coinConversionSetting->fresh(),
        ]);
    }

    /**
     * Delete conversion setting
     */
    public function destroy(CoinConversionSettings $coinConversionSetting)
    {
        // Don't allow deleting if it's the only active setting
        if ($coinConversionSetting->is_active) {
            $activeCount = CoinConversionSettings::where('is_active', true)->count();
            if ($activeCount <= 1) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete the only active setting. Please activate another setting first.',
                ], 400);
            }
        }

        $coinConversionSetting->delete();

        return response()->json([
            'success' => true,
            'message' => 'Conversion setting deleted successfully',
        ]);
    }

    /**
     * Toggle active status
     */
    public function toggleActive(CoinConversionSettings $coinConversionSetting)
    {
        if ($coinConversionSetting->is_active) {
            // Deactivate
            $coinConversionSetting->is_active = false;
            $coinConversionSetting->save();

            return response()->json([
                'success' => true,
                'message' => 'Conversion setting deactivated',
                'data' => $coinConversionSetting,
            ]);
        } else {
            // Activate (deactivate all others first)
            DB::transaction(function () use ($coinConversionSetting) {
                CoinConversionSettings::where('is_active', true)->update(['is_active' => false]);
                $coinConversionSetting->is_active = true;
                $coinConversionSetting->save();
            });

            return response()->json([
                'success' => true,
                'message' => 'Conversion setting activated',
                'data' => $coinConversionSetting->fresh(),
            ]);
        }
    }
}
