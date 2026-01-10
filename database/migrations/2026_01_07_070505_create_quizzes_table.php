<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('quizzes', function (Blueprint $table) {
            $table->id();

            $table->foreignId('category_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('sub_category_id')
                ->constrained('sub_categories')
                ->cascadeOnDelete();

            $table->string('quiz_title');
            $table->text('question');

            $table->string('option_1');
            $table->string('option_2');
            $table->string('option_3');
            $table->string('option_4');

            $table->tinyInteger('correct_answer'); // 1,2,3,4

            $table->string('image')->nullable();

            $table->tinyInteger('status')->default(1);
            $table->integer('serial')->default(0);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quizzes');
    }
};
