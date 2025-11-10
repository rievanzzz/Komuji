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
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('type')->default('string'); // string, number, boolean, json
            $table->text('description')->nullable();
            $table->string('group')->default('general'); // general, payment, business, etc
            $table->boolean('is_public')->default(false); // Can be accessed by frontend
            $table->timestamps();
            
            $table->index(['group', 'key']);
        });
        
        // Insert default settings
        DB::table('settings')->insert([
            [
                'key' => 'platform_fee_percentage',
                'value' => '10.00',
                'type' => 'number',
                'description' => 'Platform fee percentage for event transactions',
                'group' => 'business',
                'is_public' => false,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'key' => 'premium_monthly_price',
                'value' => '100000',
                'type' => 'number',
                'description' => 'Monthly price for premium panitia subscription',
                'group' => 'business',
                'is_public' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'key' => 'trial_duration_days',
                'value' => '60',
                'type' => 'number',
                'description' => 'Trial duration in days for new panitia',
                'group' => 'business',
                'is_public' => false,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'key' => 'free_max_active_events',
                'value' => '1',
                'type' => 'number',
                'description' => 'Maximum active events for free panitia',
                'group' => 'business',
                'is_public' => false,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'key' => 'premium_max_active_events',
                'value' => '999',
                'type' => 'number',
                'description' => 'Maximum active events for premium panitia (999 = unlimited)',
                'group' => 'business',
                'is_public' => false,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'key' => 'auto_approve_panitia',
                'value' => 'false',
                'type' => 'boolean',
                'description' => 'Auto approve new panitia registration',
                'group' => 'business',
                'is_public' => false,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'key' => 'platform_name',
                'value' => 'Komuji Event Platform',
                'type' => 'string',
                'description' => 'Platform name',
                'group' => 'general',
                'is_public' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'key' => 'platform_email',
                'value' => 'admin@komuji.com',
                'type' => 'string',
                'description' => 'Platform contact email',
                'group' => 'general',
                'is_public' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
