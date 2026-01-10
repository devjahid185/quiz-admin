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
        Schema::create('feature_quizzes', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('feature_id'); // কোন feature এর quiz
            $table->string('quiz_title');

            $table->text('question');

            $table->string('option_1');
            $table->string('option_2');
            $table->string('option_3');
            $table->string('option_4');

            // ⚠️ IMPORTANT
            // এখানে 0-based রাখবেন (0,1,2,3)
            $table->tinyInteger('correct_answer');

            $table->string('image')->nullable();
            $table->boolean('status')->default(1);
            $table->integer('serial')->default(0);

            $table->timestamps();

            $table->foreign('feature_id')
                ->references('id')
                ->on('features')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('feature_quizzes');
    }
};
