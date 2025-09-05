<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class PanitiaKeduaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
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

        $this->command->info('Panitia kedua berhasil ditambahkan!');
    }
}
