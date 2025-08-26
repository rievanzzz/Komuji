<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'no_handphone')) {
                $table->string('no_handphone')->after('email');
            }
            if (!Schema::hasColumn('users', 'alamat')) {
                $table->text('alamat')->after('no_handphone');
            }
            if (!Schema::hasColumn('users', 'pendidikan_terakhir')) {
                $table->string('pendidikan_terakhir')->after('alamat');
            }
            if (!Schema::hasColumn('users', 'status_akun')) {
                $table->enum('status_akun', ['aktif', 'belum_verifikasi'])->default('belum_verifikasi')->after('pendidikan_terakhir');
            }
            if (!Schema::hasColumn('users', 'otp')) {
                $table->string('otp')->nullable()->after('status_akun');
            }
            if (!Schema::hasColumn('users', 'role')) {
                $table->enum('role', ['admin', 'peserta'])->default('peserta')->after('otp');
            }
            if (!Schema::hasColumn('users', 'otp_expires_at')) {
                $table->timestamp('otp_expires_at')->nullable()->after('otp');
            }
            if (!Schema::hasColumn('users', 'verification_token')) {
                $table->string('verification_token')->nullable()->after('otp_expires_at');
            }
            if (!Schema::hasColumn('users', 'verification_token_expires_at')) {
                $table->timestamp('verification_token_expires_at')->nullable()->after('verification_token');
            }
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'no_handphone',
                'alamat',
                'pendidikan_terakhir',
                'status_akun',
                'otp',
                'role',
                'otp_expires_at',
                'verification_token',
                'verification_token_expires_at'
            ]);
        });
    }
};
