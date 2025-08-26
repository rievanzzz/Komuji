<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Registration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class RegistrationController extends Controller
{
    public function register(Request $request, Event $event)
    {
        // Cek apakah event tersedia dan sudah dipublish
        if (!$event->is_published) {
            return response()->json(['message' => 'Event tidak tersedia'], 404);
        }

        // Cek kuota
        if ($event->terdaftar >= $event->kuota) {
            return response()->json(['message' => 'Kuota peserta sudah penuh'], 400);
        }

        // Cek apakah user sudah terdaftar
        $existingRegistration = Registration::where('user_id', auth()->id())
            ->where('event_id', $event->id)
            ->first();

        if ($existingRegistration) {
            return response()->json([
                'message' => 'Anda sudah terdaftar di event ini',
                'data' => $existingRegistration
            ], 400);
        }

        DB::beginTransaction();
        try {
            // Buat registrasi
            $registration = Registration::create([
                'user_id' => auth()->id(),
                'event_id' => $event->id,
                'status' => 'approved', // atau 'pending' jika perlu persetujuan
                'kode_pendaftaran' => 'EVT-' . strtoupper(Str::random(8)),
            ]);

            // Buat token kehadiran
            $registration->attendance()->create([
                'token' => strtoupper(Str::random(10)),
                'is_verified' => false,
            ]);

            // Update jumlah pendaftar
            $event->increment('terdaftar');

            DB::commit();

            return response()->json([
                'message' => 'Pendaftaran berhasil',
                'data' => $registration->load('attendance')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Terjadi kesalahan saat mendaftar',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function myRegistrations()
    {
        $registrations = auth()->user()->registrations()
            ->with(['event', 'attendance', 'certificate'])
            ->latest()
            ->paginate(10);

        return response()->json($registrations);
    }

    public function validateAttendance(Request $request)
    {
        $request->validate([
            'token' => 'required|string|size:10',
        ]);

        $attendance = \App\Models\Attendance::where('token', $request->token)
            ->with('registration')
            ->first();

        if (!$attendance) {
            return response()->json(['message' => 'Token tidak valid'], 404);
        }

        if ($attendance->is_verified) {
            return response()->json(['message' => 'Token sudah digunakan'], 400);
        }

        // Update kehadiran
        $attendance->update([
            'is_verified' => true,
            'waktu_hadir' => now(),
        ]);

        // Generate sertifikat
        $certificate = $this->generateCertificate($attendance->registration);

        return response()->json([
            'message' => 'Kehadiran berhasil divalidasi',
            'data' => [
                'event' => $attendance->registration->event,
                'certificate' => $certificate,
            ]
        ]);
    }

    protected function generateCertificate($registration)
    {
        // Generate nomor sertifikat unik
        $certificate = $registration->certificate()->create([
            'nomor_sertifikat' => 'CERT-' . time() . '-' . $registration->id,
            'file_path' => 'certificates/' . Str::uuid() . '.pdf',
            'generated_at' => now(),
        ]);

        // TODO: Generate PDF sertifikat
        // Contoh: (new CertificateGenerator($certificate))->generate();

        return $certificate;
    }

    /**
     * Get all registrations for a specific event (admin only)
     */
    public function eventRegistrations(Event $event)
    {
        $this->authorize('viewAny', [Registration::class, $event]);
        
        $registrations = $event->registrations()
            ->with(['user', 'attendance', 'certificate'])
            ->latest()
            ->paginate(10);

        return response()->json($registrations);
    }

    /**
     * Approve a registration (admin only)
     */
    public function approve(Registration $registration)
    {
        $this->authorize('update', $registration);

        if ($registration->status === 'approved') {
            return response()->json([
                'message' => 'Pendaftaran sudah disetujui sebelumnya',
                'data' => $registration
            ]);
        }

        $registration->update([
            'status' => 'approved',
            'alasan_ditolak' => null
        ]);

        // TODO: Kirim notifikasi ke user

        return response()->json([
            'message' => 'Pendaftaran berhasil disetujui',
            'data' => $registration
        ]);
    }

    /**
     * Reject a registration (admin only)
     */
    public function reject(Request $request, Registration $registration)
    {
        $this->authorize('update', $registration);

        $request->validate([
            'alasan' => 'required|string|max:255'
        ]);

        $registration->update([
            'status' => 'rejected',
            'alasan_ditolak' => $request->alasan
        ]);

        // TODO: Kirim notifikasi ke user

        return response()->json([
            'message' => 'Pendaftaran ditolak',
            'data' => $registration
        ]);
    }
}