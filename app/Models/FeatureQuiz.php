<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FeatureQuiz extends Model
{
    use HasFactory;

    protected $fillable = [
        'feature_id',
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

    public function feature()
    {
        return $this->belongsTo(Features::class, 'feature_id');
    }
}
