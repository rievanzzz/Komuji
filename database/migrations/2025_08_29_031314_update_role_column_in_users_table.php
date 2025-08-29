<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        // First, update existing data to match new enum values
        \DB::table('users')
            ->whereIn('role', ['admin_aplikasi', 'admin'])
            ->update(['role' => 'admin']);
            
        \DB::table('users')
            ->whereIn('role', ['admin_acara', 'panitia'])
            ->update(['role' => 'panitia']);
            
        // Then modify the column
        \DB::statement("ALTER TABLE `users` 
            MODIFY COLUMN `role` ENUM('admin', 'panitia', 'peserta') NOT NULL DEFAULT 'peserta'");
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        // First, modify the column back to VARCHAR
        \DB::statement("ALTER TABLE `users` 
            MODIFY COLUMN `role` VARCHAR(255) NOT NULL DEFAULT 'peserta'");
            
        // Then update the values back to old format if needed
        \DB::table('users')
            ->where('role', 'admin')
            ->update(['role' => 'admin_aplikasi']);
            
        \DB::table('users')
            ->where('role', 'panitia')
            ->update(['role' => 'admin_acara']);
    }
};
