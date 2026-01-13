<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CoinConversionSettings extends Model
{
    use HasFactory;

    protected $table = 'coin_conversion_settings';

    protected $fillable = [
        'coins_required',
        'main_balance_amount',
        'is_active',
        'description',
        'minimum_coins',
    ];

    protected $casts = [
        'coins_required' => 'integer',
        'main_balance_amount' => 'decimal:2',
        'is_active' => 'boolean',
        'minimum_coins' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get active conversion rate
     */
    public static function getActiveSetting()
    {
        return self::where('is_active', true)->first();
    }

    /**
     * Calculate main balance from coins
     */
    public static function calculateMainBalance($coins)
    {
        $setting = self::getActiveSetting();
        if (!$setting) {
            return 0;
        }

        // Calculate how many times the conversion rate fits
        $conversions = floor($coins / $setting->coins_required);
        return $conversions * $setting->main_balance_amount;
    }

    /**
     * Get conversion rate (coins per taka)
     */
    public function getRateAttribute()
    {
        if ($this->main_balance_amount > 0) {
            return $this->coins_required / $this->main_balance_amount;
        }
        return 0;
    }
}
