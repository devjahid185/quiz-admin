<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('coin_conversion_settings', function (Blueprint $table) {
            $table->id();
            $table->integer('coins_required')->default(100); // কত কয়েন লাগবে
            $table->decimal('main_balance_amount', 10, 2)->default(10.00); // কত টাকা পাবে
            $table->boolean('is_active')->default(true); // সেটিংস active আছে কিনা
            $table->text('description')->nullable(); // বিবরণ
            $table->integer('minimum_coins')->default(100); // সর্বনিম্ন কয়েন (conversion এর জন্য)
            $table->timestamps();
        });

        // Insert default setting
        DB::table('coin_conversion_settings')->insert([
            'coins_required' => 100,
            'main_balance_amount' => 10.00,
            'is_active' => true,
            'description' => '100 coins = 10 taka',
            'minimum_coins' => 100,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coin_conversion_settings');
    }
};
