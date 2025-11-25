<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Event;
use App\Models\Category;
use App\Models\Registration;
use App\Models\Attendance;
use App\Models\Certificate;
use App\Models\TicketCategory;
use App\Models\PanitiaProfile;
use App\Models\Transaction;
use App\Models\Setting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DemoDataSeeder extends Seeder
{
    /**
     * Run the database seeds for DEMO purposes.
     * This will create realistic demo data for testing all features.
     * USES EXISTING USER ACCOUNTS - does not create new users.
     */
    public function run(): void
    {
        echo "🚀 Starting Demo Data Seeding...\n\n";

        // STEP 1: Clear existing data (except users & categories)
        $this->clearExistingData();

        // STEP 2: Create Settings
        $this->createSettings();

        // STEP 3: Fetch Existing Users
        $admin = $this->getExistingAdmin();
        $panitia = $this->getExistingPanitia();
        $peserta1 = $this->getExistingPeserta();
        $peserta2 = $this->getOrCreateExtraPeserta();

        // STEP 4: Ensure Panitia has Profile
        $this->ensurePanitiaProfile($panitia);

        // STEP 5: Create Events by Panitia
        $events = $this->createEvents($panitia);

        // STEP 6: Create Registrations for Events
        $this->createRegistrations($events, $peserta1, $peserta2);

        // STEP 7: Create Attendances (Check-ins)
        $this->createAttendances();

        // STEP 8: Create Certificates
        $this->createCertificates();

        echo "\n✅ Demo Data Seeding Completed Successfully!\n";
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
        echo "📧 USING EXISTING ACCOUNTS:\n";
        echo "   Admin    : admin@komuji.com\n";
        echo "   Panitia  : arievan920@gmail.com\n";
        echo "   Peserta  : pchnc.co@gmail.com\n";
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
    }

    private function clearExistingData()
    {
        echo "🗑️  Clearing existing event data (keeping users)...\n";

        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        Certificate::truncate();
        Attendance::truncate();
        Transaction::truncate();
        TicketCategory::truncate();
        Registration::truncate();
        Event::truncate();
        // Don't truncate PanitiaProfile - keep existing ones
        DB::table('personal_access_tokens')->truncate();

        // TIDAK menghapus users - menggunakan yang sudah ada

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        echo "   ✓ Event data cleared (users preserved)\n\n";
    }

    private function createSettings()
    {
        echo "⚙️  Creating platform settings...\n";

        $settings = [
            ['key' => 'auto_approve_panitia', 'value' => 'true', 'type' => 'boolean'],
            ['key' => 'trial_duration_days', 'value' => '60', 'type' => 'integer'],
            ['key' => 'premium_monthly_price', 'value' => '100000', 'type' => 'integer'],
            ['key' => 'free_max_active_events', 'value' => '1', 'type' => 'integer'],
            ['key' => 'premium_max_active_events', 'value' => '999', 'type' => 'integer'],
            ['key' => 'platform_commission_rate', 'value' => '5', 'type' => 'integer'],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }

        echo "   ✓ Settings created\n\n";
    }

    private function getExistingAdmin()
    {
        echo "👤 Fetching existing Admin account...\n";

        $admin = User::where('email', 'admin@komuji.com')->first();

        if (!$admin) {
            throw new \Exception("Admin account (admin@komuji.com) not found! Please create it first.");
        }

        echo "   ✓ Admin found: {$admin->email}\n\n";
        return $admin;
    }

    private function getExistingPanitia()
    {
        echo "👤 Fetching existing Panitia (Organizer) account...\n";

        $panitia = User::where('email', 'arievan920@gmail.com')->first();

        if (!$panitia) {
            throw new \Exception("Panitia account (arievan920@gmail.com) not found! Please create it first.");
        }

        echo "   ✓ Panitia found: {$panitia->email}\n\n";
        return $panitia;
    }

    private function ensurePanitiaProfile($panitia)
    {
        echo "🔍 Checking Panitia Profile...\n";

        $profile = PanitiaProfile::where('user_id', $panitia->id)->first();

        if (!$profile) {
            echo "   Creating new Panitia Profile...\n";
            PanitiaProfile::create([
                'user_id' => $panitia->id,
                'status' => 'approved',
                'plan_type' => 'trial',
                'trial_start' => now(),
                'trial_end' => now()->addDays(60),
                'max_active_events' => 999,
                'organization_name' => 'Arievan Event Management',
                'organization_description' => 'Professional event management services for all types of events',
                'phone' => $panitia->no_handphone,
                'address' => $panitia->alamat,
                'website' => 'https://arievan-events.com',
                'approved_at' => now(),
            ]);
            echo "   ✓ Panitia Profile created\n\n";
        } else {
            echo "   ✓ Panitia Profile already exists\n\n";
        }
    }

    private function getExistingPeserta()
    {
        echo "👤 Fetching existing Peserta (Participant) account...\n";

        $peserta = User::where('email', 'pchnc.co@gmail.com')->first();

        if (!$peserta) {
            throw new \Exception("Peserta account (pchnc.co@gmail.com) not found! Please create it first.");
        }

        echo "   ✓ Peserta found: {$peserta->email}\n\n";
        return $peserta;
    }

    private function getOrCreateExtraPeserta()
    {
        echo "👤 Fetching or creating extra participants...\n";

        $extraPeserta = [];
        $names = [
            'Budi Santoso', 'Siti Nurhaliza', 'Ahmad Fauzi', 'Rina Wati',
            'Dedi Wijaya', 'Lina Marlina', 'Eko Prasetyo', 'Dewi Sartika'
        ];

        foreach ($names as $index => $name) {
            $email = 'peserta' . ($index + 1) . '@demo.com';
            $user = User::where('email', $email)->first();

            if (!$user) {
                $user = User::create([
                    'name' => $name,
                    'email' => $email,
                    'password' => Hash::make('password123'),
                    'no_handphone' => '0812' . str_pad($index + 1, 8, '0', STR_PAD_LEFT),
                    'alamat' => 'Jl. Demo No. ' . ($index + 1) . ', Jakarta',
                    'pendidikan_terakhir' => ['SMA/SMK', 'Diploma', 'Sarjana'][rand(0, 2)],
                    'role' => 'peserta',
                    'status_akun' => 'sudah_verifikasi',
                    'is_active' => true,
                    'email_verified_at' => now(),
                ]);
            }
            $extraPeserta[] = $user;
        }

        echo "   ✓ " . count($extraPeserta) . " extra participants ready\n\n";
        return $extraPeserta;
    }

    private function createEvents($panitia)
    {
        echo "📅 Creating demo events...\n";

        $categories = Category::all();
        $events = [];

        // Event 1: Upcoming Event (belum dimulai)
        $events[] = Event::create([
            'judul' => 'Workshop Web Development 2025',
            'deskripsi' => 'Belajar membuat website modern dengan React dan Laravel. Workshop intensif selama 2 hari dengan praktek langsung.',
            'tanggal_mulai' => now()->addDays(7)->format('Y-m-d'),
            'tanggal_selesai' => now()->addDays(8)->format('Y-m-d'),
            'waktu_mulai' => '09:00:00',
            'waktu_selesai' => '16:00:00',
            'lokasi' => 'Gedung Informatika Lt. 3, Universitas Indonesia',
            'kuota' => 50,
            'terdaftar' => 0, // Will be updated
            'harga_tiket' => 150000,
            'kategori_id' => $categories->where('nama_kategori', 'Workshop')->first()->id,
            'created_by' => $panitia->id,
            'is_published' => true,
            'approval_type' => 'auto',
            'has_certificate' => true,
            'flyer_path' => null,
        ]);

        // Event 2: Ongoing Event (sedang berlangsung)
        $events[] = Event::create([
            'judul' => 'Seminar Digital Marketing Strategy',
            'deskripsi' => 'Pelajari strategi digital marketing terkini dari praktisi berpengalaman. Cocok untuk pemilik bisnis dan marketing enthusiast.',
            'tanggal_mulai' => now()->format('Y-m-d'),
            'tanggal_selesai' => now()->format('Y-m-d'),
            'waktu_mulai' => '08:00:00',
            'waktu_selesai' => '17:00:00',
            'lokasi' => 'Hotel Grand Mahakam, Jakarta Selatan',
            'kuota' => 100,
            'terdaftar' => 0,
            'harga_tiket' => 250000,
            'kategori_id' => $categories->where('nama_kategori', 'Seminar')->first()->id,
            'created_by' => $panitia->id,
            'is_published' => true,
            'approval_type' => 'manual',
            'has_certificate' => true,
            'flyer_path' => null,
        ]);

        // Event 3: Past Event (sudah selesai)
        $events[] = Event::create([
            'judul' => 'Bootcamp UI/UX Design',
            'deskripsi' => 'Program intensif selama 5 hari untuk menguasai UI/UX Design dari nol hingga mahir.',
            'tanggal_mulai' => now()->subDays(10)->format('Y-m-d'),
            'tanggal_selesai' => now()->subDays(6)->format('Y-m-d'),
            'waktu_mulai' => '09:00:00',
            'waktu_selesai' => '17:00:00',
            'lokasi' => 'Creative Hub Bandung, Jl. Braga No. 15',
            'kuota' => 30,
            'terdaftar' => 0,
            'harga_tiket' => 500000,
            'kategori_id' => $categories->where('nama_kategori', 'Bootcamp')->first()->id,
            'created_by' => $panitia->id,
            'is_published' => true,
            'approval_type' => 'auto',
            'has_certificate' => true,
            'flyer_path' => null,
        ]);

        // Event 4: Free Event
        $events[] = Event::create([
            'judul' => 'Webinar Karir IT: Dari Mahasiswa ke Professional',
            'deskripsi' => 'Webinar gratis untuk mahasiswa yang ingin tahu roadmap karir di industri IT.',
            'tanggal_mulai' => now()->addDays(14)->format('Y-m-d'),
            'tanggal_selesai' => now()->addDays(14)->format('Y-m-d'),
            'waktu_mulai' => '19:00:00',
            'waktu_selesai' => '21:00:00',
            'lokasi' => 'Online via Zoom',
            'kuota' => 200,
            'terdaftar' => 0,
            'harga_tiket' => 0,
            'kategori_id' => $categories->where('nama_kategori', 'Webinar')->first()->id,
            'created_by' => $panitia->id,
            'is_published' => true,
            'approval_type' => 'auto',
            'has_certificate' => true,
            'flyer_path' => null,
        ]);

        // Event 5: Event with Multiple Ticket Tiers
        $eventMultiTier = Event::create([
            'judul' => 'Tech Conference 2025: Future of AI',
            'deskripsi' => 'Konferensi teknologi terbesar tahun ini dengan pembicara dari Google, Microsoft, dan startup unicorn Indonesia.',
            'tanggal_mulai' => now()->addDays(30)->format('Y-m-d'),
            'tanggal_selesai' => now()->addDays(31)->format('Y-m-d'),
            'waktu_mulai' => '08:00:00',
            'waktu_selesai' => '18:00:00',
            'lokasi' => 'Jakarta Convention Center, Hall A',
            'kuota' => 500,
            'terdaftar' => 0,
            'harga_tiket' => 300000, // Base price
            'kategori_id' => $categories->where('nama_kategori', 'Konferensi')->first()->id,
            'created_by' => $panitia->id,
            'is_published' => true,
            'approval_type' => 'auto',
            'has_certificate' => true,
            'flyer_path' => null,
        ]);
        $events[] = $eventMultiTier;

        // Create Ticket Categories for Event 5
        TicketCategory::create([
            'event_id' => $eventMultiTier->id,
            'nama_kategori' => 'Early Bird',
            'harga' => 200000,
            'kuota' => 100,
            'deskripsi' => 'Harga spesial untuk pendaftar awal',
            'is_active' => true,
        ]);

        TicketCategory::create([
            'event_id' => $eventMultiTier->id,
            'nama_kategori' => 'Regular',
            'harga' => 300000,
            'kuota' => 300,
            'deskripsi' => 'Tiket reguler',
            'is_active' => true,
        ]);

        TicketCategory::create([
            'event_id' => $eventMultiTier->id,
            'nama_kategori' => 'VIP',
            'harga' => 500000,
            'kuota' => 100,
            'deskripsi' => 'Akses VIP dengan lunch dan networking session',
            'is_active' => true,
        ]);

        echo "   ✓ " . count($events) . " events created\n\n";
        return $events;
    }

    private function createRegistrations($events, $mainPeserta, $extraPeserta)
    {
        echo "📝 Creating registrations...\n";

        $allPeserta = array_merge([$mainPeserta], $extraPeserta);
        $totalRegistrations = 0;

        foreach ($events as $event) {
            // Determine how many registrations for this event
            $numRegistrations = match($event->judul) {
                'Workshop Web Development 2025' => 15,
                'Seminar Digital Marketing Strategy' => 25,
                'Bootcamp UI/UX Design' => 20,
                'Webinar Karir IT: Dari Mahasiswa ke Professional' => 50,
                'Tech Conference 2025: Future of AI' => 30,
                default => 10,
            };

            // Shuffle peserta untuk variasi
            shuffle($allPeserta);

            for ($i = 0; $i < min($numRegistrations, count($allPeserta)); $i++) {
                $peserta = $allPeserta[$i];

                // Generate unique QR code
                $qrCode = 'QR-' . strtoupper(substr(md5($event->id . $peserta->id . time()), 0, 12));
                $ticketNumber = 'TIX-' . str_pad($event->id, 3, '0', STR_PAD_LEFT) . '-' . str_pad($i + 1, 4, '0', STR_PAD_LEFT);

                $registration = Registration::create([
                    'user_id' => $peserta->id,
                    'event_id' => $event->id,
                    'status' => 'approved', // All approved for demo
                    'qr_code' => $qrCode,
                    'ticket_number' => $ticketNumber,
                    'check_in_status' => false, // Will be updated
                    'check_in_time' => null,
                    'created_at' => now()->subDays(rand(1, 30)),
                ]);

                // Create transaction for paid events
                if ($event->harga_tiket > 0) {
                    Transaction::create([
                        'user_id' => $peserta->id,
                        'event_id' => $event->id,
                        'registration_id' => $registration->id,
                        'amount' => $event->harga_tiket,
                        'payment_method' => ['credit_card', 'bank_transfer', 'e_wallet'][rand(0, 2)],
                        'payment_status' => 'completed',
                        'external_id' => 'TRX-' . strtoupper(substr(md5(time() . $registration->id), 0, 16)),
                        'paid_at' => now()->subDays(rand(1, 30)),
                    ]);
                }

                $totalRegistrations++;
            }

            // Update event terdaftar count
            $event->update(['terdaftar' => $numRegistrations]);
        }

        echo "   ✓ $totalRegistrations registrations created\n\n";
    }

    private function createAttendances()
    {
        echo "✅ Creating attendance records (check-ins)...\n";

        // Get past and ongoing events
        $eventsToCheckIn = Event::whereDate('tanggal_mulai', '<=', now())->get();
        $totalCheckins = 0;

        foreach ($eventsToCheckIn as $event) {
            $registrations = Registration::where('event_id', $event->id)
                ->where('status', 'approved')
                ->get();

            // 80% of registered participants check in
            $checkInCount = (int) ($registrations->count() * 0.8);

            foreach ($registrations->take($checkInCount) as $registration) {
                // Generate attendance token
                $token = strtoupper(substr(md5($registration->id . time()), 0, 32));

                Attendance::create([
                    'registration_id' => $registration->id,
                    'check_in_time' => Carbon::parse($event->tanggal_mulai . ' ' . $event->waktu_mulai)->addMinutes(rand(-30, 60)),
                    'token' => $token,
                ]);

                // Update registration check_in_status
                $registration->update([
                    'check_in_status' => true,
                    'check_in_time' => Carbon::parse($event->tanggal_mulai . ' ' . $event->waktu_mulai)->addMinutes(rand(-30, 60)),
                ]);

                $totalCheckins++;
            }
        }

        echo "   ✓ $totalCheckins check-ins created\n\n";
    }

    private function createCertificates()
    {
        echo "🎓 Creating certificates...\n";

        // Only for checked-in participants in past events
        $pastEvents = Event::whereDate('tanggal_selesai', '<', now())->get();
        $totalCertificates = 0;

        foreach ($pastEvents as $event) {
            $checkedInRegistrations = Registration::where('event_id', $event->id)
                ->where('check_in_status', true)
                ->get();

            foreach ($checkedInRegistrations as $registration) {
                $certificateNumber = 'CERT-' . strtoupper(substr(md5($registration->id . time()), 0, 16));

                Certificate::create([
                    'user_id' => $registration->user_id,
                    'event_id' => $event->id,
                    'certificate_number' => $certificateNumber,
                    'issued_at' => Carbon::parse($event->tanggal_selesai)->addHours(2),
                    'pdf_path' => null, // Will be generated on download
                ]);

                $totalCertificates++;
            }
        }

        echo "   ✓ $totalCertificates certificates created\n\n";
    }
}
