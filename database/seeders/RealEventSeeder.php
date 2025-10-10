<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Event;
use Carbon\Carbon;

class RealEventSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing events safely
        \DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Event::truncate();
        \DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $events = [
            [
                'kategori_id' => 1,
                'judul' => 'Seminar Digital Marketing 2025',
                'deskripsi' => 'Pelajari strategi digital marketing terbaru untuk mengembangkan bisnis Anda di era digital. Workshop ini akan membahas SEO, Social Media Marketing, Content Marketing, dan Google Ads.',
                'tanggal_mulai' => '2025-01-15',
                'tanggal_selesai' => '2025-01-15',
                'waktu_mulai' => '09:00:00',
                'waktu_selesai' => '17:00:00',
                'lokasi' => 'Ruang Seminar A, Gedung Utama',
                'harga_tiket' => 0,
                'kuota' => 100,
                'terdaftar' => 25,
                'is_published' => true,
                'approval_type' => 'auto',
                'created_by' => 1,
            ],
            [
                'kategori_id' => 1,
                'judul' => 'Workshop React Development',
                'deskripsi' => 'Belajar membuat aplikasi web modern dengan React.js dari dasar hingga mahir. Termasuk hooks, state management, dan deployment.',
                'tanggal_mulai' => '2025-01-20',
                'tanggal_selesai' => '2025-01-22',
                'waktu_mulai' => '08:00:00',
                'waktu_selesai' => '16:00:00',
                'lokasi' => 'Lab Komputer 1, Lantai 2',
                'harga_tiket' => 150000,
                'kuota' => 30,
                'terdaftar' => 18,
                'is_published' => true,
                'approval_type' => 'manual',
                'created_by' => 1,
            ],
            [
                'judul' => 'Konser Musik Akustik',
                'deskripsi' => 'Nikmati malam yang hangat dengan musik akustik dari musisi lokal terbaik. Menampilkan berbagai genre dari folk hingga indie.',
                'tanggal_mulai' => '2025-02-01',
                'tanggal_selesai' => '2025-02-01',
                'waktu_mulai' => '19:00:00',
                'waktu_selesai' => '22:00:00',
                'lokasi' => 'Auditorium Utama',
                'harga_tiket' => 75000,
                'kuota' => 200,
                'terdaftar' => 150,
                'is_published' => true,
                'approval_type' => 'auto',
                'created_by' => 1,
            ],
            [
                'judul' => 'Startup Pitch Competition',
                'deskripsi' => 'Kompetisi pitch untuk startup teknologi. Kesempatan untuk mempresentasikan ide bisnis Anda kepada investor dan mentor berpengalaman.',
                'tanggal_mulai' => '2025-02-10',
                'tanggal_selesai' => '2025-02-10',
                'waktu_mulai' => '10:00:00',
                'waktu_selesai' => '18:00:00',
                'lokasi' => 'Innovation Hub, Jakarta',
                'harga_tiket' => 50000,
                'kuota' => 50,
                'terdaftar' => 35,
                'is_published' => true,
                'approval_type' => 'manual',
                'created_by' => 1,
            ],
            [
                'judul' => 'Festival Kuliner Nusantara',
                'deskripsi' => 'Festival kuliner yang menampilkan makanan tradisional dari berbagai daerah di Indonesia. Nikmati cita rasa autentik nusantara.',
                'tanggal_mulai' => '2025-02-14',
                'tanggal_selesai' => '2025-02-16',
                'waktu_mulai' => '10:00:00',
                'waktu_selesai' => '21:00:00',
                'lokasi' => 'Lapangan Banteng, Jakarta Pusat',
                'harga_tiket' => 25000,
                'kuota' => 500,
                'terdaftar' => 320,
                'is_published' => true,
                'approval_type' => 'auto',
                'created_by' => 1,
            ],
            [
                'judul' => 'Workshop Photography',
                'deskripsi' => 'Belajar teknik fotografi dari dasar hingga advanced. Termasuk komposisi, lighting, editing, dan tips untuk menjadi fotografer profesional.',
                'tanggal_mulai' => '2025-02-20',
                'tanggal_selesai' => '2025-02-21',
                'waktu_mulai' => '09:00:00',
                'waktu_selesai' => '17:00:00',
                'lokasi' => 'Studio Foto Creative Space',
                'harga_tiket' => 200000,
                'kuota' => 20,
                'terdaftar' => 15,
                'is_published' => true,
                'approval_type' => 'manual',
                'created_by' => 1,
            ],
            [
                'judul' => 'Tech Talk: AI & Machine Learning',
                'deskripsi' => 'Diskusi mendalam tentang perkembangan AI dan Machine Learning. Pembicara dari Google, Microsoft, dan startup AI lokal.',
                'tanggal_mulai' => '2025-03-01',
                'tanggal_selesai' => '2025-03-01',
                'waktu_mulai' => '14:00:00',
                'waktu_selesai' => '18:00:00',
                'lokasi' => 'Tech Hub Coworking Space',
                'harga_tiket' => 0,
                'kuota' => 80,
                'terdaftar' => 65,
                'is_published' => true,
                'approval_type' => 'auto',
                'created_by' => 1,
            ],
            [
                'judul' => 'Pameran Seni Rupa Kontemporer',
                'deskripsi' => 'Pameran karya seni rupa kontemporer dari seniman muda Indonesia. Menampilkan berbagai medium dari lukisan hingga instalasi.',
                'tanggal_mulai' => '2025-03-05',
                'tanggal_selesai' => '2025-03-15',
                'waktu_mulai' => '10:00:00',
                'waktu_selesai' => '20:00:00',
                'lokasi' => 'Galeri Nasional Indonesia',
                'harga_tiket' => 15000,
                'kuota' => 300,
                'terdaftar' => 180,
                'is_published' => true,
                'approval_type' => 'auto',
                'created_by' => 1,
            ]
        ];

        foreach ($events as $event) {
            // Ensure kategori_id is set for all events
            if (!isset($event['kategori_id'])) {
                $event['kategori_id'] = 1;
            }
            Event::create($event);
        }

        $this->command->info('Real events seeded successfully!');
    }
}
