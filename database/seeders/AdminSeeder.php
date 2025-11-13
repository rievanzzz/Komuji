<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        User::create([
            'name' => 'Admin Komuji',
            'email' => 'admin@komuji.com',
            'no_handphone' => '081234567890',
            'alamat' => 'Jakarta, Indonesia',
            'pendidikan_terakhir' => 'Sarjana',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'status_akun' => 'aktif',
            'email_verified_at' => now(),
        ]);

        // Create test user for upgrade testing
        User::create([
            'name' => 'Test User',
            'email' => 'testuser@komuji.com',
            'no_handphone' => '081234567891',
            'alamat' => 'Bandung, Indonesia',
            'pendidikan_terakhir' => 'SMA/SMK',
            'password' => Hash::make('testuser123'),
            'role' => 'peserta',
            'status_akun' => 'aktif',
            'email_verified_at' => now(),
        ]);

        echo "✅ Admin dan Test User berhasil dibuat!\n";
        echo "📧 Admin: admin@komuji.com | Password: admin123\n";
        echo "📧 Test User: testuser@komuji.com | Password: testuser123\n";
    }
}
