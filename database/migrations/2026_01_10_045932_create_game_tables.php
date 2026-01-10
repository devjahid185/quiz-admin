<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1️⃣ Rooms table
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->string('room_code')->unique(); // e.g. 123456
            $table->unsignedBigInteger('host_id');
            $table->string('status')->default('waiting'); // waiting | playing | finished
            $table->timestamps();

            // optional FK
            // $table->foreign('host_id')->references('id')->on('users')->onDelete('cascade');
        });

        // 2️⃣ Room players table
        Schema::create('room_players', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('room_id');
            $table->unsignedBigInteger('user_id');
            $table->integer('score')->default(0);
            $table->timestamps();

            // optional FK
            // $table->foreign('room_id')->references('id')->on('rooms')->onDelete('cascade');
            // $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

            // prevent duplicate join
            $table->unique(['room_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room_players');
        Schema::dropIfExists('rooms');
    }
};
