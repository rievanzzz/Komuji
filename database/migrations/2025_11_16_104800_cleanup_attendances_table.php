<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Normalize columns
        Schema::table('attendances', function (Blueprint $table) {
            if (!Schema::hasColumn('attendances', 'status')) {
                $table->enum('status', ['pending', 'checked_in', 'checked_out'])->default('pending')->after('token');
            }
            if (Schema::hasColumn('attendances', 'qr_code_data')) {
                $table->dropColumn('qr_code_data');
            }
            if (!Schema::hasColumn('attendances', 'check_in_time')) {
                $table->timestamp('check_in_time')->nullable()->after('qr_code_path');
            }
            if (!Schema::hasColumn('attendances', 'check_out_time')) {
                $table->timestamp('check_out_time')->nullable()->after('check_in_time');
            }
            if (Schema::hasColumn('attendances', 'waktu_hadir')) {
                $table->dropColumn('waktu_hadir');
            }
            if (Schema::hasColumn('attendances', 'is_verified')) {
                $table->dropColumn('is_verified');
            }
        });

        // Initialize legacy rows to safe default status
        if (Schema::hasColumn('attendances', 'status')) {
            DB::statement("UPDATE attendances SET status = 'pending' WHERE status IS NULL OR status = ''");
        }

        // Ensure unique indexes using raw SQL to avoid doctrine dependency
        // registration_id unique
        $index = DB::select("SHOW INDEX FROM attendances WHERE Key_name = 'attendances_registration_id_unique'");
        if (empty($index)) {
            // Make sure no duplicate exists (fallback keeps the lowest id)
            DB::statement("DELETE a1 FROM attendances a1 JOIN attendances a2 ON a1.registration_id = a2.registration_id AND a1.id > a2.id");
            DB::statement("ALTER TABLE attendances ADD UNIQUE INDEX attendances_registration_id_unique (registration_id)");
        }

        // token unique
        $indexToken = DB::select("SHOW INDEX FROM attendances WHERE Key_name = 'attendances_token_unique'");
        if (empty($indexToken)) {
            DB::statement("ALTER TABLE attendances ADD UNIQUE INDEX attendances_token_unique (token)");
        }

        // Ensure FK exists (only add if missing)
        $fk = DB::select("SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'attendances' AND COLUMN_NAME = 'registration_id' AND REFERENCED_TABLE_NAME IS NOT NULL LIMIT 1");
        if (empty($fk)) {
            Schema::table('attendances', function (Blueprint $table) {
                $table->foreign('registration_id')->references('id')->on('registrations')->onDelete('cascade');
            });
        }
    }

    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            // Drop FK if exists
            try { $table->dropForeign(['registration_id']); } catch (\Throwable $e) {}
            // Drop unique indexes if they exist
            try { $table->dropUnique('attendances_registration_id_unique'); } catch (\Throwable $e) {}
            try { $table->dropUnique('attendances_token_unique'); } catch (\Throwable $e) {}

            if (!Schema::hasColumn('attendances', 'waktu_hadir')) {
                $table->timestamp('waktu_hadir')->nullable()->after('token');
            }
            if (!Schema::hasColumn('attendances', 'is_verified')) {
                $table->boolean('is_verified')->default(false)->after('waktu_hadir');
            }
            if (!Schema::hasColumn('attendances', 'qr_code_data')) {
                $table->longText('qr_code_data')->nullable()->after('token');
            }
            if (Schema::hasColumn('attendances', 'status')) {
                $table->dropColumn('status');
            }
            if (Schema::hasColumn('attendances', 'check_in_time')) {
                $table->dropColumn('check_in_time');
            }
            if (Schema::hasColumn('attendances', 'check_out_time')) {
                $table->dropColumn('check_out_time');
            }
        });
    }
};
