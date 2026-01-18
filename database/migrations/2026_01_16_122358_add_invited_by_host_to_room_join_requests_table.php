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
        Schema::table('room_join_requests', function (Blueprint $table) {
            $table->boolean('invited_by_host')->default(false)->after('status');
            $table->index('invited_by_host');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('room_join_requests', function (Blueprint $table) {
            $table->dropIndex(['invited_by_host']);
            $table->dropColumn('invited_by_host');
        });
    }
};
