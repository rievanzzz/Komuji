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
        Schema::table('transactions', function (Blueprint $table) {
            // Add columns if they don't exist
            if (!Schema::hasColumn('transactions', 'transaction_id')) {
                $table->string('transaction_id')->unique()->after('id');
            }
            if (!Schema::hasColumn('transactions', 'order_id')) {
                $table->string('order_id')->unique()->after('transaction_id');
            }
            if (!Schema::hasColumn('transactions', 'midtrans_response')) {
                $table->json('midtrans_response')->nullable()->after('gateway_response');
            }
            if (!Schema::hasColumn('transactions', 'expired_at')) {
                $table->timestamp('expired_at')->nullable()->after('paid_at');
            }
            
            // Update type enum to include new values
            DB::statement("ALTER TABLE transactions MODIFY COLUMN type ENUM('event_payment', 'premium_subscription', 'payout', 'refund', 'event_registration', 'premium_upgrade') NOT NULL");
            
            // Update status enum to include new values  
            DB::statement("ALTER TABLE transactions MODIFY COLUMN status ENUM('pending', 'paid', 'failed', 'cancelled', 'refunded', 'expired') NOT NULL DEFAULT 'pending'");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn(['transaction_id', 'order_id', 'midtrans_response', 'expired_at']);
        });
    }
};
