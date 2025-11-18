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
        Schema::create('withdrawals', function (Blueprint $table) {
            $table->id();
            $table->string('withdrawal_code')->unique(); // WD-20241113-ABC123
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('bank_account_id')->constrained()->onDelete('cascade');
            $table->decimal('amount', 15, 2); // Jumlah yang diminta withdraw
            $table->decimal('admin_fee', 15, 2)->default(0); // Biaya admin (misal 2500)
            $table->decimal('net_amount', 15, 2); // Amount setelah dipotong admin fee
            $table->enum('status', ['pending', 'approved', 'processed', 'completed', 'rejected', 'cancelled'])->default('pending');
            $table->text('notes')->nullable(); // Catatan panitia
            $table->text('admin_notes')->nullable(); // Catatan admin
            $table->string('transfer_proof')->nullable(); // Bukti transfer dari admin
            $table->timestamp('requested_at')->useCurrent();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null'); // Admin yang approve
            $table->timestamps();
            
            // Indexes
            $table->index(['user_id', 'status']);
            $table->index(['status', 'created_at']);
            $table->index('withdrawal_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('withdrawals');
    }
};
