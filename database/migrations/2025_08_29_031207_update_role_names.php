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
        // Update admin_aplikasi to admin
        \DB::table('users')
            ->where('role', 'admin_aplikasi')
            ->update(['role' => 'admin']);
            
        // Update admin_acara to panitia
        \DB::table('users')
            ->where('role', 'admin_acara')
            ->update(['role' => 'panitia']);
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        // Revert admin to admin_aplikasi
        \DB::table('users')
            ->where('role', 'admin')
            ->update(['role' => 'admin_aplikasi']);
            
        // Revert panitia to admin_acara
        \DB::table('users')
            ->where('role', 'panitia')
            ->update(['role' => 'admin_acara']);
    }
};
