<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('blocked')->default(false)->after('password');
            $table->decimal('main_balance', 10, 2)->default(0)->after('blocked');
            $table->integer('coin_balance')->default(0)->after('main_balance');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['blocked', 'main_balance', 'coin_balance']);
        });
    }
};
