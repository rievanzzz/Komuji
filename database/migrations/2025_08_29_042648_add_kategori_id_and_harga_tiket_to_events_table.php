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
        Schema::table('events', function (Blueprint $table) {
            $table->foreignId('kategori_id')->after('id')->constrained('categories')->onDelete('restrict');
            $table->decimal('harga_tiket', 12, 2)->after('kategori_id')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropForeign(['kategori_id']);
            $table->dropColumn(['kategori_id', 'harga_tiket']);
        });
    }
};
