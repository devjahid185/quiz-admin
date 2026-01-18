<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PromotionalImage extends Model
{
    use HasFactory;

    protected $table = 'promotional_images';

    protected $fillable = [
        'title',
        'image',
        'link',
        'is_active',
        'position',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'position' => 'integer',
    ];
}
