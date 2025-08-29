<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ValidateAttendanceRequest;
use App\Models\Attendance;
use App\Models\Event;
use App\Models\Registration;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
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

    /**
     * Cancel a registration
     *
     * @param Registration $registration
     * @return \Illuminate\Http\JsonResponse
     */
    public function cancelRegistration($id)
    {
        try {
            // Cari registrasi beserta relasinya
            $registration = Registration::with(['event', 'attendance', 'certificate'])->findOrFail($id);
            
            // Debug: Log user yang sedang login dan pemilik registrasi
            Log::info('Cancel Registration Debug', [
                'logged_in_user_id' => auth()->id(),
                'registration_user_id' => $registration->user_id,
                'registration_id' => $registration->id,
                'registration_data' => $registration->toArray()
            ]);

            // Cek apakah user adalah pemilik registrasi
            if ($registration->user_id != auth()->id()) {
                Log::error('Unauthorized cancellation attempt', [
                    'user_id' => auth()->id(),
                    'registration_user_id' => $registration->user_id
                ]);
                return response()->json([
                    'message' => 'Anda tidak memiliki akses untuk membatalkan registrasi ini'
                ], 403);
            }
            
            // Cek apakah event berbayar
            if (isset($registration->event->is_berbayar) && $registration->event->is_berbayar) {
                return response()->json([
                    'message' => 'Tidak bisa membatalkan registrasi event berbayar',
                    'event_type' => 'berbayar'
                ], 400);
            }

            // Cek apakah event sudah berlangsung
            $event = $registration->event;
            if (!$event) {
                return response()->json([
                    'message' => 'Event tidak ditemukan',
                    'registration_id' => $id
                ], 404);
            }
            
            try {
                $eventDate = Carbon::parse($event->tanggal_mulai);
                $eventTime = Carbon::parse($event->waktu_mulai);
                $eventDateTime = Carbon::create(
                    $eventDate->year, $eventDate->month, $eventDate->day,
                    $eventTime->hour, $eventTime->minute, $eventTime->second
                );
                
                if ($eventDateTime->isPast()) {
                    return response()->json([
                        'message' => 'Tidak bisa membatalkan registrasi karena event sudah berlangsung',
                        'event_date' => $eventDateTime->format('Y-m-d H:i:s'),
                        'now' => now()->format('Y-m-d H:i:s')
                    ], 400);
                }
            } catch (\Exception $e) {
                Log::error('Error parsing date: ' . $e->getMessage());
                return response()->json([
                    'message' => 'Terjadi kesalahan saat memproses jadwal event',
                    'error' => $e->getMessage()
                ], 500);
            }

            DB::beginTransaction();
            try {
                // Hapus attendance terkait
                if ($registration->attendance) {
                    $registration->attendance()->delete();
                }
                
                // Hapus sertifikat jika ada
                if ($registration->certificate) {
                    $registration->certificate()->delete();
                }
                
                // Hapus registrasi
                $registration->delete();
                
                // Update jumlah pendaftar
                $event->decrement('terdaftar');

                DB::commit();

                return response()->json([
                    'message' => 'Registrasi berhasil dibatalkan',
                    'registration_id' => $id
                ]);

            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Gagal membatalkan registrasi: ' . $e->getMessage());
                Log::error($e);
                
                return response()->json([
                    'message' => 'Gagal membatalkan registrasi',
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ], 500);
            }
        } catch (\Exception $e) {
            Log::error('Error in cancelRegistration: ' . $e->getMessage());
            return response()->json([
                'message' => 'Terjadi kesalahan saat memproses pembatalan',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Validate attendance using token
     *
     * @param ValidateAttendanceRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function validateAttendance(ValidateAttendanceRequest $request)
    {
        $event = Event::findOrFail($request->event_id);
        $now = now();
        
        // Cek waktu event
        $eventStart = Carbon::parse($event->tanggal_mulai . ' ' . $event->waktu_mulai);
        $eventEnd = Carbon::parse($event->tanggal_selesai . ' ' . $event->waktu_selesai);
        
        if (!$now->between($eventStart, $eventEnd)) {
            return response()->json([
                'message' => 'Absensi hanya bisa dilakukan pada saat event berlangsung',
                'event_time' => [
                    'start' => $eventStart->format('Y-m-d H:i:s'),
                    'end' => $eventEnd->format('Y-m-d H:i:s'),
                    'now' => $now->format('Y-m-d H:i:s')
                ]
            ], 400);
        }

        // Cari registrasi yang sesuai
        $registration = Registration::whereHas('attendance', function($q) use ($request) {
                $q->where('token', $request->token);
            })
            ->where('event_id', $request->event_id)
            ->where('user_id', auth()->id())
            ->first();

        if (!$registration) {
            return response()->json([
                'message' => 'Token tidak valid atau tidak sesuai dengan event'
            ], 400);
        }

        // Cek apakah sudah absen
        if ($registration->attendance->is_verified) {
            return response()->json([
                'message' => 'Anda sudah melakukan absensi sebelumnya',
                'attended_at' => $registration->attendance->waktu_hadir
            ], 400);
        }

        DB::beginTransaction();
        try {
            // Update kehadiran
            $registration->attendance()->update([
                'is_verified' => true,
                'waktu_hadir' => $now
            ]);

            // Tandai registrasi sebagai hadir
            $registration->update(['is_attended' => true]);

            DB::commit();

            return response()->json([
                'message' => 'Absensi berhasil',
                'event_id' => $event->id,
                'user_id' => auth()->id(),
                'attended_at' => $now->format('Y-m-d H:i:s')
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Gagal validasi absensi: ' . $e->getMessage());
            
            return response()->json([
                'message' => 'Gagal melakukan absensi',
                'error' => $e->getMessage()
            ], 500);
        }
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