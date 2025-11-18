<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            if (!Schema::hasColumn('events', 'certificate_template_id')) {
                $table->unsignedBigInteger('certificate_template_id')->nullable()->after('sertifikat_template_path');
            }
            if (!Schema::hasColumn('events', 'manual_issue')) {
                $table->boolean('manual_issue')->default(true)->after('certificate_template_id');
            }
            if (!Schema::hasColumn('events', 'allow_certificate_reject')) {
                $table->boolean('allow_certificate_reject')->default(true)->after('manual_issue');
            }
            if (!Schema::hasColumn('events', 'certificate_signature_name')) {
                $table->string('certificate_signature_name')->nullable()->after('allow_certificate_reject');
            }
            if (!Schema::hasColumn('events', 'certificate_signature_title')) {
                $table->string('certificate_signature_title')->nullable()->after('certificate_signature_name');
            }
            if (!Schema::hasColumn('events', 'certificate_signature_image_path')) {
                $table->string('certificate_signature_image_path')->nullable()->after('certificate_signature_title');
            }
            if (!Schema::hasColumn('events', 'certificate_date')) {
                $table->date('certificate_date')->nullable()->after('certificate_signature_image_path');
            }
            if (!Schema::hasColumn('events', 'certificate_layout_config')) {
                $table->json('certificate_layout_config')->nullable()->after('certificate_date');
            }
        });

        if (Schema::hasTable('certificate_templates')) {
            Schema::table('events', function (Blueprint $table) {
                // Add FK constraint separately to avoid errors if column already exists without FK
                if (Schema::hasColumn('events', 'certificate_template_id')) {
                    $table->foreign('certificate_template_id')->references('id')->on('certificate_templates')->nullOnDelete();
                }
            });
        }
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            if (Schema::hasColumn('events', 'certificate_template_id')) {
                try { $table->dropForeign(['certificate_template_id']); } catch (\Throwable $e) {}
            }
        });

        Schema::table('events', function (Blueprint $table) {
            if (Schema::hasColumn('events', 'certificate_layout_config')) {
                $table->dropColumn('certificate_layout_config');
            }
            if (Schema::hasColumn('events', 'certificate_date')) {
                $table->dropColumn('certificate_date');
            }
            if (Schema::hasColumn('events', 'certificate_signature_image_path')) {
                $table->dropColumn('certificate_signature_image_path');
            }
            if (Schema::hasColumn('events', 'certificate_signature_title')) {
                $table->dropColumn('certificate_signature_title');
            }
            if (Schema::hasColumn('events', 'certificate_signature_name')) {
                $table->dropColumn('certificate_signature_name');
            }
            if (Schema::hasColumn('events', 'allow_certificate_reject')) {
                $table->dropColumn('allow_certificate_reject');
            }
            if (Schema::hasColumn('events', 'manual_issue')) {
                $table->dropColumn('manual_issue');
            }
            if (Schema::hasColumn('events', 'certificate_template_id')) {
                $table->dropColumn('certificate_template_id');
            }
        });
    }
};
