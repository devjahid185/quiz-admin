<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CoinHistory extends Model
{
    use HasFactory;

    protected $table = 'coin_history';

    protected $fillable = [
        'user_id',
        'coins',
        'type',
        'source',
        'description',
        'reference_id',
        'reference_type',
        'balance_before',
        'balance_after',
    ];

    protected $casts = [
        'coins' => 'integer',
        'balance_before' => 'integer',
        'balance_after' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeEarned($query)
    {
        return $query->where('type', 'earned')->where('coins', '>', 0);
    }

    public function scopeSpent($query)
    {
        return $query->where('type', 'spent')->where('coins', '<', 0);
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
