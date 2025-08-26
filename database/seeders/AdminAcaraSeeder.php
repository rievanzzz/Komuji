<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminAcaraSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Admin Acara',
            'email' => 'adminacara@sekolah.id',
            'password' => Hash::make('AdminAcara123#'),
            'role' => 'admin_acara'
        ]);
    }
}
