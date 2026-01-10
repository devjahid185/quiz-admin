<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

// App\Models\SubCategory.php
class SubCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'title',
        'image',
        'description',
        'status',
        'serial',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function quizzes()
    {
        return $this->hasMany(Quiz::class);
    }
}
