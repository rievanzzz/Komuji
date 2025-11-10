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
        Schema::create('panitia_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Status & Approval
            $table->enum('status', ['pending', 'approved', 'rejected', 'suspended'])->default('pending');
            $table->text('rejection_reason')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            
            // Plan & Trial
            $table->enum('plan_type', ['trial', 'free', 'premium'])->default('trial');
            $table->timestamp('trial_start')->nullable();
            $table->timestamp('trial_end')->nullable();
            $table->timestamp('premium_start')->nullable();
            $table->timestamp('premium_end')->nullable();
            
            // Financial
            $table->decimal('saldo', 15, 2)->default(0);
            $table->decimal('total_earnings', 15, 2)->default(0);
            $table->decimal('total_fees_paid', 15, 2)->default(0);
            
            // Limits & Stats
            $table->integer('max_active_events')->default(1); // 1 for trial/free, unlimited for premium
            $table->integer('total_events_created')->default(0);
            $table->integer('total_participants')->default(0);
            
            // Additional Info
            $table->string('organization_name')->nullable();
            $table->text('organization_description')->nullable();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->string('website')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index(['status', 'plan_type']);
            $table->index('trial_end');
            $table->index('premium_end');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('panitia_profiles');
    }
};
