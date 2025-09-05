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
            'role' => 'admin',
            'password' => Hash::make('admin123'),
            'no_handphone' => '081234567890',
            'alamat' => 'Jl. Contoh No. 123',
            'pendidikan_terakhir' => 'S1',
            'status_akun' => 'aktif',
            'email_verified_at' => now(),
        ]);

        // Buat admin acara 1
        User::factory()->create([
            'name' => 'Admin Acara',
            'email' => 'adminacara@example.com',
            'password' => Hash::make('admin123'),
            'role' => 'panitia',
            'no_handphone' => '081234567891',
            'alamat' => 'Jl. Contoh No. 124',
            'pendidikan_terakhir' => 'S1',
            'status_akun' => 'aktif',
            'email_verified_at' => now(),
        ]);

        // Buat admin acara 2
        User::factory()->create([
            'name' => 'Panitia Dua',
            'email' => 'panitia2@example.com',
            'password' => Hash::make('panitia123'),
            'role' => 'panitia',
            'no_handphone' => '081234567892',
            'alamat' => 'Jl. Contoh No. 125',
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
