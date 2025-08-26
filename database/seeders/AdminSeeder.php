<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // ✅ Admin Aplikasi
        User::updateOrCreate(
            ['email' => 'admin@sekolah.id'],
            [
                'name' => 'Super Admin',
                'email' => 'admin@sekolah.id',
                'no_handphone' => '081234567890',
                'alamat' => 'Jl. Sekolah No. 1',
                'pendidikan_terakhir' => 'Sarjana',
                'password' => Hash::make('Password123#'),
                'role' => 'admin_aplikasi',
                'status_akun' => 'aktif',
            ]
        );

        // ✅ Admin Acara
        User::updateOrCreate(
            ['email' => 'acara@sekolah.id'],
            [
                'name' => 'Panitia Event',
                'email' => 'acara@sekolah.id',
                'no_handphone' => '081234567891',
                'alamat' => 'Jl. Kegiatan No. 2',
                'pendidikan_terakhir' => 'Diploma',
                'password' => Hash::make('AdminAcara123#'),
                'role' => 'admin_acara',
                'status_akun' => 'aktif',
            ]
        );
    }
}
