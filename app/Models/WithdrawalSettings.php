<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WithdrawalSettings extends Model
{
    use HasFactory;

    protected $table = 'withdrawal_settings';

    protected $fillable = [
        'minimum_amount',
        'maximum_amount',
        'fee_percentage',
        'fee_fixed',
        'processing_days',
        'is_active',
        'description',
        'payment_methods',
    ];

    protected $casts = [
        'minimum_amount' => 'decimal:2',
        'maximum_amount' => 'decimal:2',
        'fee_percentage' => 'decimal:2',
        'fee_fixed' => 'decimal:2',
        'processing_days' => 'integer',
        'is_active' => 'boolean',
        'payment_methods' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get active withdrawal settings
     */
    public static function getActiveSetting()
    {
        return self::where('is_active', true)->first();
    }

    /**
     * Calculate fee for withdrawal amount
     */
    public function calculateFee($amount)
    {
        $percentageFee = ($amount * $this->fee_percentage) / 100;
        return $percentageFee + $this->fee_fixed;
    }

    /**
     * Calculate net amount after fee
     */
    public function calculateNetAmount($amount)
    {
        return $amount - $this->calculateFee($amount);
    }

    /**
     * Validate withdrawal amount
     */
    public function validateAmount($amount)
    {
        if ($amount < $this->minimum_amount) {
            return ['valid' => false, 'message' => "Minimum withdrawal amount is ৳{$this->minimum_amount}"];
        }

        if ($this->maximum_amount && $amount > $this->maximum_amount) {
            return ['valid' => false, 'message' => "Maximum withdrawal amount is ৳{$this->maximum_amount}"];
        }

        return ['valid' => true];
    }
}
