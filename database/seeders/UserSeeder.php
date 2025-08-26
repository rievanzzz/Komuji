<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Buat admin
        User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'role' => 'admin_aplikasi',
            'password' => Hash::make('admin123'),
            'no_handphone' => '081234567890',
            'alamat' => 'Jl. Contoh No. 123',
            'pendidikan_terakhir' => 'S1',
            'status_akun' => 'aktif',
            'email_verified_at' => now(),
        ]);

        // Buat admin acara
        User::factory()->create([
            'name' => 'Admin Acara',
            'email' => 'adminacara@example.com',
            'password' => Hash::make('admin123'),
            'role' => 'admin_acara',
            'no_handphone' => '081234567891',
            'alamat' => 'Jl. Contoh No. 124',
            'pendidikan_terakhir' => 'S1',
            'status_akun' => 'aktif',
            'email_verified_at' => now(),
        ]);

        // Buat beberapa peserta
        User::factory(10)->create([
            'role' => 'peserta',
            'status_akun' => 'aktif',
            'email_verified_at' => now(),
        ]);
    }
}
