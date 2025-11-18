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
        Schema::create('commissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->constrained()->onDelete('cascade');
            $table->foreignId('organizer_id')->constrained('users')->onDelete('cascade'); // Panitia yang dapat komisi
            $table->enum('type', ['event_commission', 'platform_fee']); // Jenis komisi
            $table->decimal('percentage', 5, 2); // Persentase komisi (misal 5.00 = 5%)
            $table->decimal('amount', 15, 2); // Jumlah komisi dalam rupiah
            $table->decimal('base_amount', 15, 2); // Amount dasar sebelum komisi
            $table->enum('status', ['pending', 'paid', 'hold'])->default('pending');
            $table->timestamp('paid_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index(['organizer_id', 'status']);
            $table->index(['type', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('commissions');
    }
};
