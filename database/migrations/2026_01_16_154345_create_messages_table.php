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
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('conversation_id');
            $table->unsignedBigInteger('sender_id');
            $table->unsignedBigInteger('receiver_id');
            $table->text('message')->nullable(); // Text message (nullable for media-only messages)
            $table->enum('type', ['text', 'image', 'voice', 'file'])->default('text');
            $table->string('media_url')->nullable(); // URL for image/voice/file
            $table->string('media_thumbnail')->nullable(); // Thumbnail for images
            $table->integer('voice_duration')->nullable(); // Duration in seconds for voice messages
            $table->string('file_name')->nullable(); // Original file name
            $table->integer('file_size')->nullable(); // File size in bytes
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            // Foreign keys
            $table->index('conversation_id');
            $table->index('sender_id');
            $table->index('receiver_id');
            $table->index('is_read');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
