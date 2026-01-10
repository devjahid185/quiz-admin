<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'image',
        'description',
        'status',
        'serial',
    ];

    public function subCategories()
    {
        return $this->hasMany(SubCategory::class);
    }

    public function quizzes()
    {
        return $this->hasMany(Quiz::class);
    }
}
