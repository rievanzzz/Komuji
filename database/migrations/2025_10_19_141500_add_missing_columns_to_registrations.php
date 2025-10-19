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
        Schema::table('registrations', function (Blueprint $table) {
            // Hanya tambahkan kolom yang belum ada berdasarkan screenshot
            $table->date('tanggal_lahir')->nullable()->after('jenis_kelamin');
            $table->string('email_peserta')->nullable()->after('tanggal_lahir');
            $table->decimal('total_harga', 12, 2)->default(0)->after('email_peserta');
            $table->enum('payment_status', ['pending', 'paid', 'failed', 'free'])->default('free')->after('total_harga');
            $table->string('payment_method')->nullable()->after('payment_status');
            $table->string('invoice_number')->nullable()->after('payment_method');
            $table->text('qr_code')->nullable()->after('invoice_number');
            $table->timestamp('payment_expired_at')->nullable()->after('qr_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('registrations', function (Blueprint $table) {
            $table->dropColumn([
                'tanggal_lahir',
                'email_peserta', 
                'total_harga',
                'payment_status',
                'payment_method',
                'invoice_number',
                'qr_code',
                'payment_expired_at'
            ]);
        });
    }
};
