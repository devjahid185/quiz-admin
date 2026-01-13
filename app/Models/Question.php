<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;

class Question extends Model
{
    use HasFactory;

    protected $fillable = [
        'question_text',
        'option_a',
        'option_b',
        'option_c',
        'option_d',
        'correct_option',
        'category_id',
        'difficulty_level',
    ];

    // Map question_text to question column if needed
    public function getQuestionTextAttribute()
    {
        return $this->attributes['question'] ?? $this->attributes['question_text'] ?? null;
    }

    public function setQuestionTextAttribute($value)
    {
        if (Schema::hasColumn($this->getTable(), 'question_text')) {
            $this->attributes['question_text'] = $value;
        } else {
            $this->attributes['question'] = $value;
        }
    }

    public function category()
    {
        // Only return relationship if category_id column exists
        if (Schema::hasColumn($this->getTable(), 'category_id')) {
            return $this->belongsTo(Category::class);
        }
        return null;
    }
}