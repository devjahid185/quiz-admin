<?php

// App\Models\Quiz.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Quiz extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'sub_category_id',
        'quiz_title',
        'question',
        'option_1',
        'option_2',
        'option_3',
        'option_4',
        'correct_answer',
        'image',
        'status',
        'serial',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function subCategory()
    {
        return $this->belongsTo(SubCategory::class);
    }
}

