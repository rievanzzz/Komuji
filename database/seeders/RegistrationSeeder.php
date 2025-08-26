<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\Registration;
use App\Models\User;
use Illuminate\Database\Seeder;

class RegistrationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ambil semua event yang sudah dipublikasi
        $events = Event::where('is_published', true)->get();
        
        // Ambil semua peserta
        $users = User::where('role', 'peserta')->get();
        
        foreach ($events as $event) {
            // Batasi jumlah peserta yang mendaftar ke setiap event
            $maxRegistrations = min(rand(5, $event->kuota), $users->count());
            $participants = $users->random($maxRegistrations);
            
            foreach ($participants as $user) {
                // Pastikan user belum terdaftar di event ini
                $existingRegistration = Registration::where('user_id', $user->id)
                    ->where('event_id', $event->id)
                    ->exists();
                
                if (!$existingRegistration) {
                    // Buat pendaftaran dengan status acak (approved/pending/rejected)
                    $status = $this->getRandomStatus();
                    
                    $registration = Registration::factory()
                        ->state([
                            'user_id' => $user->id,
                            'event_id' => $event->id,
                            'status' => $status,
                            'kode_pendaftaran' => 'REG-' . strtoupper(uniqid()),
                            'alasan_ditolak' => $status === 'rejected' ? 'Kuota sudah penuh' : null,
                        ])
                        ->create();
                    
                    // Jika status approved, tambahkan ke daftar hadir
                    if ($status === 'approved') {
                        $this->createAttendance($registration);
                        
                        // Jika event sudah lewat, buat sertifikat
                        if ($event->tanggal_selesai < now()) {
                            $this->createCertificate($registration);
                        }
                    }
                }
            }
            
            // Update jumlah peserta terdaftar
            $event->update([
                'terdaftar' => $event->registrations()->where('status', 'approved')->count()
            ]);
        }
    }
    
    /**
     * Get random registration status
     */
    private function getRandomStatus(): string
    {
        $statuses = ['approved', 'pending', 'rejected'];
        $weights = [70, 20, 10]; // 70% approved, 20% pending, 10% rejected
        
        $rand = mt_rand(1, array_sum($weights));
        $total = 0;
        
        foreach ($weights as $i => $weight) {
            $total += $weight;
            if ($rand <= $total) {
                return $statuses[$i];
            }
        }
        
        return 'pending';
    }
    
    /**
     * Create attendance for approved registration
     */
    private function createAttendance($registration): void
    {
        $faker = \Faker\Factory::create();
        $event = $registration->event;
        
        // Hanya buat kehadiran jika event sudah selesai
        if ($event->tanggal_selesai < now()) {
            $registration->attendance()->create([
                'token' => strtoupper(substr(md5(uniqid()), 0, 10)),
                'waktu_hadir' => $faker->dateTimeBetween(
                    $event->tanggal_mulai,
                    $event->tanggal_selesai
                ),
                'is_verified' => true,
            ]);
        }
    }
    
    /**
     * Create certificate for attended event
     */
    private function createCertificate($registration): void
    {
        $event = $registration->event;
        
        // Hanya buat sertifikat jika event sudah selesai dan memiliki template
        if ($event->tanggal_selesai < now() && $event->sertifikat_template_path) {
            $registration->certificate()->create([
                'nomor_sertifikat' => 'CERT-' . strtoupper(uniqid()),
                'file_path' => 'certificates/' . uniqid() . '.pdf',
                'generated_at' => now(),
            ]);
        }
    }
}
