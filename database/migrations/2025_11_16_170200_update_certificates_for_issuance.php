<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('certificates', function (Blueprint $table) {
            if (!Schema::hasColumn('certificates', 'status')) {
                $table->enum('status', ['pending', 'generated', 'rejected'])->default('pending')->after('generated_at');
            }
            if (!Schema::hasColumn('certificates', 'display_name')) {
                $table->string('display_name')->nullable()->after('status');
            }
            if (!Schema::hasColumn('certificates', 'rejected_reason')) {
                $table->string('rejected_reason')->nullable()->after('display_name');
            }
            if (!Schema::hasColumn('certificates', 'template_snapshot')) {
                $table->json('template_snapshot')->nullable()->after('rejected_reason');
            }
            if (!Schema::hasColumn('certificates', 'sent_at')) {
                $table->timestamp('sent_at')->nullable()->after('template_snapshot');
            }
        });
    }

    public function down(): void
    {
        Schema::table('certificates', function (Blueprint $table) {
            if (Schema::hasColumn('certificates', 'sent_at')) {
                $table->dropColumn('sent_at');
            }
            if (Schema::hasColumn('certificates', 'template_snapshot')) {
                $table->dropColumn('template_snapshot');
            }
            if (Schema::hasColumn('certificates', 'rejected_reason')) {
                $table->dropColumn('rejected_reason');
            }
            if (Schema::hasColumn('certificates', 'display_name')) {
                $table->dropColumn('display_name');
            }
            if (Schema::hasColumn('certificates', 'status')) {
                $table->dropColumn('status');
            }
        });
    }
};
