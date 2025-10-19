<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // First, let's check what columns exist
        $columns = Schema::getColumnListing('registrations');
        
        Schema::table('registrations', function (Blueprint $table) use ($columns) {
            // Add ticket_category_id if it doesn't exist
            if (!in_array('ticket_category_id', $columns)) {
                $table->unsignedBigInteger('ticket_category_id')->nullable()->after('event_id');
                $table->foreign('ticket_category_id')->references('id')->on('ticket_categories')->onDelete('cascade');
            }
            
            // Add participant data columns if they don't exist
            if (!in_array('nama_peserta', $columns)) {
                $table->string('nama_peserta')->nullable()->after('kode_pendaftaran');
            }
            if (!in_array('jenis_kelamin', $columns)) {
                $table->enum('jenis_kelamin', ['L', 'P'])->nullable()->after('nama_peserta');
            }
            if (!in_array('tanggal_lahir', $columns)) {
                $table->date('tanggal_lahir')->nullable()->after('jenis_kelamin');
            }
            if (!in_array('email_peserta', $columns)) {
                $table->string('email_peserta')->nullable()->after('tanggal_lahir');
            }
            
            // Add payment related columns if they don't exist
            if (!in_array('total_harga', $columns)) {
                $table->decimal('total_harga', 12, 2)->default(0)->after('email_peserta');
            }
            if (!in_array('payment_status', $columns)) {
                $table->enum('payment_status', ['pending', 'paid', 'failed', 'free'])->default('free')->after('total_harga');
            }
            if (!in_array('payment_method', $columns)) {
                $table->string('payment_method')->nullable()->after('payment_status');
            }
            if (!in_array('invoice_number', $columns)) {
                $table->string('invoice_number')->nullable()->after('payment_method');
            }
            if (!in_array('qr_code', $columns)) {
                $table->text('qr_code')->nullable()->after('invoice_number');
            }
            if (!in_array('payment_expired_at', $columns)) {
                $table->timestamp('payment_expired_at')->nullable()->after('qr_code');
            }
        });
        
        // Update existing registrations with default values for new columns
        DB::table('registrations')->whereNull('payment_status')->update(['payment_status' => 'free']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('registrations', function (Blueprint $table) {
            // Check if columns exist before dropping
            $columns = Schema::getColumnListing('registrations');
            
            if (in_array('ticket_category_id', $columns)) {
                $table->dropForeign(['ticket_category_id']);
                $table->dropColumn('ticket_category_id');
            }
            
            $columnsToRemove = [
                'nama_peserta', 'jenis_kelamin', 'tanggal_lahir', 'email_peserta',
                'total_harga', 'payment_status', 'payment_method', 'invoice_number',
                'qr_code', 'payment_expired_at'
            ];
            
            foreach ($columnsToRemove as $column) {
                if (in_array($column, $columns)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
