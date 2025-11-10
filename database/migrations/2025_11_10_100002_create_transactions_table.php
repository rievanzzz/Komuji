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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            
            // Related entities
            $table->foreignId('event_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // peserta
            $table->foreignId('panitia_id')->constrained('users')->onDelete('cascade'); // panitia
            $table->foreignId('registration_id')->nullable()->constrained()->onDelete('set null');
            
            // Transaction details
            $table->string('transaction_code')->unique();
            $table->enum('type', ['event_payment', 'premium_subscription', 'payout', 'refund']);
            $table->decimal('gross_amount', 15, 2); // Total amount before fees
            $table->decimal('platform_fee', 15, 2)->default(0); // Fee for platform
            $table->decimal('net_amount', 15, 2); // Amount after fees
            $table->decimal('platform_fee_percentage', 5, 2)->default(10.00); // Store fee percentage used
            
            // Payment info
            $table->enum('status', ['pending', 'paid', 'failed', 'cancelled', 'refunded'])->default('pending');
            $table->string('payment_method')->nullable();
            $table->string('payment_gateway')->nullable(); // midtrans, xendit, manual, etc
            $table->string('gateway_transaction_id')->nullable();
            $table->json('gateway_response')->nullable();
            
            // Timestamps
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamp('refunded_at')->nullable();
            
            // Additional info
            $table->text('description')->nullable();
            $table->text('notes')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index(['status', 'type']);
            $table->index(['panitia_id', 'status']);
            $table->index(['user_id', 'status']);
            $table->index('paid_at');
            $table->index('transaction_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
