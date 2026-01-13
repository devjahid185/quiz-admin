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
        // Withdrawal Settings Table (Admin Configuration)
        Schema::create('withdrawal_settings', function (Blueprint $table) {
            $table->id();
            $table->decimal('minimum_amount', 10, 2)->default(100.00); // Minimum withdrawal amount
            $table->decimal('maximum_amount', 10, 2)->nullable(); // Maximum withdrawal amount (null = unlimited)
            $table->decimal('fee_percentage', 5, 2)->default(0.00); // Fee percentage (e.g., 2.5%)
            $table->decimal('fee_fixed', 10, 2)->default(0.00); // Fixed fee amount
            $table->integer('processing_days')->default(1); // Processing time in days
            $table->boolean('is_active')->default(true);
            $table->text('description')->nullable();
            $table->json('payment_methods')->nullable(); // Allowed payment methods: bkash, nagad, rocket, bank, etc.
            $table->timestamps();
        });

        // Withdrawal Requests Table
        Schema::create('withdrawal_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();
            
            $table->decimal('amount', 10, 2); // Requested amount
            $table->decimal('fee', 10, 2)->default(0.00); // Calculated fee
            $table->decimal('net_amount', 10, 2); // Amount after fee (amount - fee)
            
            $table->string('payment_method'); // bkash, nagad, rocket, bank
            $table->string('account_number'); // Phone number or account number
            $table->string('account_name')->nullable(); // Account holder name
            $table->string('bank_name')->nullable(); // For bank transfers
            $table->string('branch_name')->nullable(); // For bank transfers
            $table->text('notes')->nullable(); // User notes
            
            $table->enum('status', ['pending', 'processing', 'approved', 'completed', 'rejected', 'cancelled'])->default('pending');
            $table->text('admin_notes')->nullable(); // Admin notes
            $table->foreignId('processed_by')->nullable()->constrained('admins')->nullOnDelete(); // Admin who processed
            $table->timestamp('processed_at')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index('user_id');
            $table->index('status');
            $table->index('created_at');
            $table->index(['user_id', 'status']);
        });

        // Balance History Table (Main Balance Transactions)
        Schema::create('balance_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();
            
            $table->decimal('amount', 10, 2); // Positive for credit, negative for debit
            $table->string('type')->default('credit'); // credit, debit, withdrawal, deposit, conversion, refund, etc.
            $table->string('source')->nullable(); // coin_conversion, withdrawal, admin, deposit, etc.
            $table->text('description')->nullable();
            $table->unsignedBigInteger('reference_id')->nullable(); // withdrawal_request_id, coin_conversion_id, etc.
            $table->string('reference_type')->nullable(); // WithdrawalRequest, CoinConversion, etc.
            
            $table->decimal('balance_before', 10, 2)->default(0);
            $table->decimal('balance_after', 10, 2)->default(0);
            
            $table->timestamps();
            
            // Indexes
            $table->index('user_id');
            $table->index('created_at');
            $table->index(['user_id', 'created_at']);
            $table->index('type');
        });

        // Insert default withdrawal settings
        DB::table('withdrawal_settings')->insert([
            'minimum_amount' => 100.00,
            'maximum_amount' => 50000.00,
            'fee_percentage' => 2.50,
            'fee_fixed' => 5.00,
            'processing_days' => 1,
            'is_active' => true,
            'description' => 'Default withdrawal settings',
            'payment_methods' => json_encode(['bkash', 'nagad', 'rocket', 'bank']),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('balance_history');
        Schema::dropIfExists('withdrawal_requests');
        Schema::dropIfExists('withdrawal_settings');
    }
};
