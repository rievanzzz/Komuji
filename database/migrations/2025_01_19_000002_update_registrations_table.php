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
            // Add columns only if they don't already exist
            if (!Schema::hasColumn('registrations', 'ticket_category_id')) {
                $table->foreignId('ticket_category_id')->nullable()->after('event_id')->constrained('ticket_categories')->onDelete('cascade');
            }
            if (!Schema::hasColumn('registrations', 'nama_peserta')) {
                $table->string('nama_peserta')->nullable()->after('kode_pendaftaran');
            }
            if (!Schema::hasColumn('registrations', 'jenis_kelamin')) {
                $table->enum('jenis_kelamin', ['L', 'P'])->nullable()->after('nama_peserta');
            }
            if (!Schema::hasColumn('registrations', 'tanggal_lahir')) {
                $table->date('tanggal_lahir')->nullable()->after('jenis_kelamin');
            }
            if (!Schema::hasColumn('registrations', 'email_peserta')) {
                $table->string('email_peserta')->nullable()->after('tanggal_lahir');
            }
            if (!Schema::hasColumn('registrations', 'total_harga')) {
                $table->decimal('total_harga', 12, 2)->default(0)->after('email_peserta');
            }
            if (!Schema::hasColumn('registrations', 'payment_status')) {
                $table->enum('payment_status', ['pending', 'paid', 'failed', 'free'])->default('free')->after('total_harga');
            }
            if (!Schema::hasColumn('registrations', 'payment_method')) {
                $table->string('payment_method')->nullable()->after('payment_status');
            }
            if (!Schema::hasColumn('registrations', 'invoice_number')) {
                $table->string('invoice_number')->nullable()->after('payment_method');
            }
            if (!Schema::hasColumn('registrations', 'qr_code')) {
                $table->text('qr_code')->nullable()->after('invoice_number');
            }
            if (!Schema::hasColumn('registrations', 'payment_expired_at')) {
                $table->timestamp('payment_expired_at')->nullable()->after('qr_code');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('registrations', function (Blueprint $table) {
            // Drop foreign key and columns only if they exist
            if (Schema::hasColumn('registrations', 'ticket_category_id')) {
                $table->dropForeign(['ticket_category_id']);
            }
            
            $columns = [
                'ticket_category_id',
                'nama_peserta',
                'jenis_kelamin',
                'tanggal_lahir',
                'email_peserta',
                'total_harga',
                'payment_status',
                'payment_method',
                'invoice_number',
                'qr_code',
                'payment_expired_at'
            ];
            
            foreach ($columns as $column) {
                if (Schema::hasColumn('registrations', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
