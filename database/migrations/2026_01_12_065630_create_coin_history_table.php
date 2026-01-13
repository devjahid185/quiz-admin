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
        Schema::create('coin_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();
            
            $table->integer('coins'); // Positive for earned, negative for spent
            $table->string('type')->default('earned'); // earned, spent, bonus, reward, penalty, etc.
            $table->string('source')->nullable(); // quiz, question, admin, game, purchase, etc.
            $table->text('description')->nullable(); // What happened
            $table->unsignedBigInteger('reference_id')->nullable(); // quiz_id, question_id, room_id, etc.
            $table->string('reference_type')->nullable(); // Quiz, Question, Room, etc.
            
            $table->integer('balance_before')->default(0); // Balance before transaction
            $table->integer('balance_after')->default(0); // Balance after transaction
            
            $table->timestamps();
            
            // Indexes for better query performance
            $table->index('user_id');
            $table->index('created_at');
            $table->index(['user_id', 'created_at']);
            $table->index('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coin_history');
    }
};
