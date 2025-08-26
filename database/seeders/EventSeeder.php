<?php

namespace Database\Seeders;

use App\Models\Event;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class EventSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Event yang akan datang (upcoming)
        Event::factory(5)
            ->upcoming()
            ->published()
            ->withFlyer()
            ->withCertificate()
            ->create([
                'kuota' => 100,
            ]);

        // Event yang sudah lewat (past)
        Event::factory(3)
            ->past()
            ->published()
            ->withFlyer()
            ->withCertificate()
            ->create([
                'kuota' => 50,
            ]);

        // Event yang belum dipublikasi
        Event::factory(2)
            ->unpublished()
            ->withFlyer()
            ->create([
                'kuota' => 30,
            ]);

        // Event khusus dengan kuota terbatas
        $specialEvent = Event::factory()
            ->published()
            ->withFlyer()
            ->withCertificate()
            ->create([
                'judul' => 'Seminar Teknologi Terkini',
                'deskripsi' => 'Seminar tentang perkembangan teknologi terkini di berbagai bidang.',
                'tanggal_mulai' => Carbon::now()->addDays(7),
                'tanggal_selesai' => Carbon::now()->addDays(8),
                'waktu_mulai' => '09:00:00',
                'waktu_selesai' => '17:00:00',
                'lokasi' => 'Aula Utama Kampus',
                'kuota' => 200,
            ]);
    }
}
