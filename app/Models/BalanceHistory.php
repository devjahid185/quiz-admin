<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BalanceHistory extends Model
{
    use HasFactory;

    protected $table = 'balance_history';

    protected $fillable = [
        'user_id',
        'amount',
        'type',
        'source',
        'description',
        'reference_id',
        'reference_type',
        'balance_before',
        'balance_after',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'balance_before' => 'decimal:2',
        'balance_after' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeCredit($query)
    {
        return $query->where('type', 'credit')->where('amount', '>', 0);
    }

    public function scopeDebit($query)
    {
        return $query->where('type', 'debit')->where('amount', '<', 0);
    }

    public function scopeByPeriod($query, $period = 'all')
    {
        switch ($period) {
            case 'weekly':
                return $query->where('created_at', '>=', now()->startOfWeek());
            case 'monthly':
                return $query->where('created_at', '>=', now()->startOfMonth());
            case 'all':
            default:
                return $query;
        }
    }
}
