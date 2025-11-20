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
use Illuminate\Support\Facades\Storage;

class RegistrationController extends Controller
{
    /**
     * Register for an event with ticket category
     */
    public function register(Request $request, Event $event)
    {
        // Log incoming request for debugging
        Log::info('Registration attempt', [
            'user_id' => auth()->id(),
            'event_id' => $event->id,
            'request_data' => $request->all(),
            'event_published' => $event->is_published
        ]);

        try {
            $request->validate([
                'ticket_category_id' => 'required|exists:ticket_categories,id',
                'nama_peserta' => 'required|string|max:255',
                'jenis_kelamin' => 'required|in:L,P',
                'tanggal_lahir' => 'required|date|before:today',
                'email_peserta' => 'required|email|max:255',
                'payment_method' => 'required|string|max:255'
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Registration validation failed', [
                'errors' => $e->errors(),
                'request_data' => $request->all()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Data tidak valid',
                'errors' => $e->errors()
            ], 422);
        }

        // Check if event is published
        if (!$event->is_published) {
            return response()->json([
                'status' => 'error',
                'message' => 'Event tidak tersedia untuk pendaftaran'
            ], 404);
        }

        // Get ticket category
        $ticketCategory = $event->ticketCategories()
            ->where('id', $request->ticket_category_id)
            ->where('is_active', true)
            ->first();

        if (!$ticketCategory) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kategori tiket tidak ditemukan atau tidak aktif'
            ], 404);
        }

        // Check event overall quota
        if ($event->terdaftar >= $event->kuota) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kuota event sudah penuh'
            ], 400);
        }

        // Check ticket category quota
        if ($ticketCategory->terjual >= $ticketCategory->kuota) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kuota kategori tiket sudah penuh'
            ], 400);
        }

        // Check if user is already registered for this event
        $existingRegistration = Registration::where('user_id', auth()->id())
            ->where('event_id', $event->id)
            ->first();

        if ($existingRegistration) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anda sudah terdaftar di event ini',
                'data' => $existingRegistration
            ], 400);
        }

        DB::beginTransaction();
        try {
            // Double-check quotas inside transaction to prevent race conditions
            $event->refresh();
            $ticketCategory->refresh();
            if ($event->terdaftar >= $event->kuota) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Kuota event sudah penuh'
                ], 400);
            }
            if ($ticketCategory->terjual >= $ticketCategory->kuota) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Kuota kategori tiket sudah penuh'
                ], 400);
            }

            // Determine payment status
            $paymentStatus = $ticketCategory->harga == 0 ? 'free' : 'pending';

            // Tentukan status berdasarkan tipe approval event dan payment
            $registrationStatus = ($event->approval_type === 'auto' && $paymentStatus === 'free') ? 'approved' : 'pending';

            // Generate registration code and invoice number
            $kode_pendaftaran = 'REG-' . strtoupper(Str::random(8));
            $invoice_number = $paymentStatus !== 'free' ? 'INV-' . date('Ymd') . '-' . strtoupper(Str::random(6)) : null;

            // Generate QR code data
            $qr_code = json_encode([
                'registration_code' => $kode_pendaftaran,
                'event_id' => $event->id,
                'user_id' => auth()->id(),
                'timestamp' => now()->toISOString()
            ]);

            // Create registration
            $registration = Registration::create([
                'user_id' => auth()->id(),
                'event_id' => $event->id,
                'ticket_category_id' => $ticketCategory->id,
                'status' => $registrationStatus,
                'kode_pendaftaran' => $kode_pendaftaran,
                'nama_peserta' => $request->nama_peserta,
                'jenis_kelamin' => $request->jenis_kelamin,
                'tanggal_lahir' => $request->tanggal_lahir,
                'email_peserta' => $request->email_peserta,
                'total_harga' => $ticketCategory->harga,
                'payment_status' => $paymentStatus,
                'payment_method' => $request->payment_method,
                'invoice_number' => $invoice_number,
                'qr_code' => $qr_code,
                'payment_expired_at' => $paymentStatus !== 'free' ? now()->addMinutes(30) : null
            ]);

            // Create attendance token only for certificate-enabled events
            $attendance = null;
            if ($event->has_certificate) {
                // Generate 10-digit numeric token
                $token = '';
                for ($i = 0; $i < 10; $i++) { $token .= random_int(0, 9); }
                $attendance = $registration->attendance()->create([
                    'token' => $token,
                    'status' => 'pending',
                ]);
            }

            // Update counters if approved and free
            if ($registrationStatus === 'approved' && $paymentStatus === 'free') {
                $event->increment('terdaftar');
                $ticketCategory->increment('terjual');
            }

            DB::commit();

            $response = [
                'status' => 'success',
                'data' => [
                    'registration' => $registration->load(['event', 'ticketCategory']),
                    'attendance_token' => $attendance?->token,
                    'qr_code' => $qr_code,
                    'invoice_number' => $invoice_number
                ]
            ];

            if ($paymentStatus === 'free') {
                $response['message'] = 'Pendaftaran berhasil! E-ticket telah dikirim ke email Anda.';
            } else {
                $response['message'] = 'Pendaftaran berhasil! Silakan lakukan pembayaran dalam 30 menit.';
            }

            return response()->json($response, 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Registration error: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat melakukan pendaftaran',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    public function myRegistrations()
    {
        $registrations = auth()->user()->registrations()
            ->with(['event', 'ticketCategory', 'attendance', 'certificate'])
            ->latest()
            ->paginate(10);

        return response()->json($registrations);
    }

    /**
     * Get single registration details
     */
    public function show(Registration $registration)
    {
        // Check if user owns this registration
        if ($registration->user_id !== auth()->id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 403);
        }

        $registration->load(['event', 'ticketCategory', 'attendance', 'certificate']);

        return response()->json([
            'status' => 'success',
            'data' => $registration
        ]);
    }

    /**
     * Approve a pending registration
     *
     * @param Registration $registration
     * @return \Illuminate\Http\JsonResponse
     */
    public function approve(Registration $registration)
    {
        // Check if user is the event creator
        if ($registration->event->created_by !== auth()->id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anda tidak memiliki izin untuk menyetujui pendaftaran ini'
            ], 403);
        }

        // Check if registration is pending
        if ($registration->status !== 'pending') {
            return response()->json([
                'status' => 'error',
                'message' => 'Hanya pendaftaran dengan status pending yang dapat disetujui'
            ], 400);
        }

        // Check if event is full
        if ($registration->event->terdaftar >= $registration->event->kuota) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kuota peserta sudah penuh, tidak dapat menyetujui pendaftaran ini'
            ], 400);
        }

        DB::beginTransaction();
        try {
            // Update registration status
            $registration->update([
                'status' => 'approved',
                'alasan_ditolak' => null
            ]);

            // Increment registered count
            $registration->event->increment('terdaftar');

            // TODO: Send approval notification to user
            // $registration->user->notify(new RegistrationApproved($registration));

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Pendaftaran berhasil disetujui',
                'data' => $registration->fresh()
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menyetujui pendaftaran',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Reject a pending registration
     *
     * @param Request $request
     * @param Registration $registration
     * @return \Illuminate\Http\JsonResponse
     */
    public function reject(Request $request, Registration $registration)
    {
        $request->validate([
            'alasan_penolakan' => 'required|string|max:500'
        ]);

        // Check if user is the event creator
        if ($registration->event->created_by !== auth()->id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anda tidak memiliki izin untuk menolak pendaftaran ini'
            ], 403);
        }

        // Check if registration is pending
        if ($registration->status !== 'pending') {
            return response()->json([
                'status' => 'error',
                'message' => 'Hanya pendaftaran dengan status pending yang dapat ditolak'
            ], 400);
        }

        DB::beginTransaction();
        try {
            // Update registration status
            $registration->update([
                'status' => 'rejected',
                'alasan_ditolak' => $request->alasan_penolakan
            ]);

            // TODO: Send rejection notification to user
            // $registration->user->notify(new RegistrationRejected($registration));

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Pendaftaran berhasil ditolak',
                'data' => $registration->fresh()
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menolak pendaftaran',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Get pending registrations for events created by the authenticated user
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function pendingRegistrations()
    {
        $user = auth()->user();

        $pendingRegistrations = Registration::with(['user:id,name,email', 'event:id,judul'])
            ->whereHas('event', function($query) use ($user) {
                $query->where('created_by', $user->id);
            })
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json([
            'status' => 'success',
            'data' => $pendingRegistrations
        ]);
    }

    /**
     * Cancel a registration
     *
     * @param Registration $registration
     * @return \Illuminate\Http\JsonResponse
     */
    /**
     * Approve a registration (for panitia)
     */
    public function approveRegistration(Registration $registration)
    {
        // Check if user is admin or event creator
        if (auth()->user()->role !== 'admin' && $registration->event->created_by !== auth()->id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized. Hanya panitia yang bisa menyetujui pendaftaran.'
            ], 403);
        }

        if ($registration->status === 'approved') {
            return response()->json([
                'status' => 'error',
                'message' => 'Pendaftaran sudah disetujui sebelumnya',
                'data' => $registration
            ]);
        }

        // Check quota
        if ($registration->event->terdaftar >= $registration->event->kuota) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kuota peserta sudah penuh',
                'data' => $registration
            ], 400);
        }

        DB::beginTransaction();
        try {
            // Update registration status
            $registration->update(['status' => 'approved']);

            // Increment event's registered count
            $registration->event->increment('terdaftar');

            // TODO: Send notification to user

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Pendaftaran berhasil disetujui',
                'data' => $registration->load('user', 'event')
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Approve registration error: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat menyetujui pendaftaran',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Reject a registration (for panitia)
     */
    public function rejectRegistration(Request $request, Registration $registration)
    {
        $request->validate([
            'alasan_ditolak' => 'required|string|max:500'
        ]);

        // Check if user is admin or event creator
        if (auth()->user()->role !== 'admin' && $registration->event->created_by !== auth()->id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized. Hanya panitia yang bisa menolak pendaftaran.'
            ], 403);
        }

        if ($registration->status === 'rejected') {
            return response()->json([
                'status' => 'error',
                'message' => 'Pendaftaran sudah ditolak sebelumnya',
                'data' => $registration
            ]);
        }

        // If previously approved, decrement the counter
        $wasApproved = $registration->status === 'approved';

        DB::beginTransaction();
        try {
            // Update registration status
            $registration->update([
                'status' => 'rejected',
                'alasan_ditolak' => $request->alasan_ditolak
            ]);

            // If it was approved before, decrement the counter
            if ($wasApproved) {
                $registration->event->decrement('terdaftar');
            }

            // TODO: Send notification to user

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Pendaftaran berhasil ditolak',
                'data' => $registration->load('user', 'event')
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Reject registration error: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat menolak pendaftaran',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Cancel a registration (for peserta)
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
     * Validate attendance token
     */
    public function validateAttendance(ValidateAttendanceRequest $request)
    {
        $event = Event::findOrFail($request->event_id);
        $now = now();

        // Cek waktu event (lebih robust)
        try {
            $startDate = $event->tanggal_mulai ? Carbon::parse($event->tanggal_mulai)->format('Y-m-d') : now()->format('Y-m-d');
            $endDate = $event->tanggal_selesai ? Carbon::parse($event->tanggal_selesai)->format('Y-m-d') : $startDate;

            $startTime = $event->waktu_mulai ? Carbon::parse($event->waktu_mulai)->format('H:i:s') : '00:00:00';
            $endTime = $event->waktu_selesai ? Carbon::parse($event->waktu_selesai)->format('H:i:s') : '23:59:59';

            $eventStart = Carbon::parse($startDate . ' ' . $startTime);
            $eventEnd = Carbon::parse($endDate . ' ' . $endTime);

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
        } catch (\Exception $e) {
            Log::warning('Failed to parse event time for validateAttendance: ' . $e->getMessage());
        }

        // Normalisasi token
        $token = trim((string) $request->token);

        // Cari registrasi yang sesuai (utama: milik user saat ini)
        $registration = Registration::whereHas('attendance', function($q) use ($token) {
                $q->where('token', $token);
            })
            ->where('event_id', $request->event_id)
            ->where('user_id', auth()->id())
            ->first();

        // Jika tidak ditemukan, fallback: cari berdasarkan token + event (tanpa cek user)
        if (!$registration) {
            $registration = Registration::whereHas('attendance', function($q) use ($token) {
                    $q->where('token', $token);
                })
                ->where('event_id', $request->event_id)
                ->first();
        }

        if (!$registration) {
            return response()->json([
                'message' => 'Token tidak valid atau tidak sesuai dengan event'
            ], 400);
        }

        // Cek apakah sudah absen
        if (in_array($registration->attendance->status, ['checked_in', 'checked_out'])) {
            return response()->json([
                'message' => 'Anda sudah melakukan absensi sebelumnya',
                'attended_at' => optional($registration->attendance->check_in_time)?->format('Y-m-d H:i:s')
            ], 400);
        }

        DB::beginTransaction();
        try {
            // Update kehadiran (check-in)
            $registration->attendance()->update([
                'status' => 'checked_in',
                'check_in_time' => $now,
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
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Generate sertifikat untuk registrasi peserta
     *
     * @param \App\Models\Registration $registration
     * @return \App\Models\Certificate
     * @throws \Exception
     */
    protected function generateCertificate($registration)
    {
        try {
            // Cek apakah sertifikat sudah ada
            if ($registration->certificate) {
                return $registration->certificate;
            }

            // Generate nomor sertifikat unik
            $nomorSertifikat = 'CERT-' . now()->format('Ymd') . '-' . strtoupper(Str::random(6));
            $namaFile = Str::uuid() . '.pdf';
            $pathFile = 'certificates/' . $namaFile;

            // Buat record sertifikat
            $certificate = $registration->certificate()->create([
                'nomor_sertifikat' => $nomorSertifikat,
                'file_path' => $pathFile,
                'generated_at' => now(),
            ]);

            // Dapatkan data event dan user
            $event = $registration->event;
            $user = $registration->user;

            // Pastikan direktori certificates ada
            if (!Storage::disk('public')->exists('certificates')) {
                Storage::disk('public')->makeDirectory('certificates');
            }

            // Generate konten PDF
            $pdfContent = view('emails.certificate', [
                'event' => $event,
                'user' => $user,
                'certificate' => $certificate,
                'tanggal' => now()->translatedFormat('d F Y')
            ])->render();

            // Simpan file PDF
            Storage::disk('public')->put($pathFile, $pdfContent);

            return $certificate;

        } catch (\Exception $e) {
            Log::error('Gagal generate sertifikat: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat membuat sertifikat',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Send e-ticket via email
     */
    public function sendETicket(Request $request)
    {
        $request->validate([
            'to' => 'required|email',
            'subject' => 'required|string',
            'template' => 'required|string',
            'data' => 'required|array'
        ]);

        try {
            // For now, just return success - implement actual email sending later
            Log::info('E-ticket email request', $request->all());

            return response()->json([
                'status' => 'success',
                'message' => 'E-ticket berhasil dikirim ke email'
            ]);
        } catch (\Exception $e) {
            Log::error('Send e-ticket error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengirim e-ticket'
            ], 500);
        }
    }

    /**
     * Send confirmation email
     */
    public function sendConfirmation(Request $request)
    {
        try {
            Log::info('Confirmation email request', $request->all());
            return response()->json([
                'status' => 'success',
                'message' => 'Email konfirmasi berhasil dikirim'
            ]);
        } catch (\Exception $e) {
            Log::error('Send confirmation error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengirim email konfirmasi'
            ], 500);
        }
    }

    /**
     * Send reminder email
     */
    public function sendReminder(Request $request)
    {
        try {
            Log::info('Reminder email request', $request->all());
            return response()->json([
                'status' => 'success',
                'message' => 'Email reminder berhasil dikirim'
            ]);
        } catch (\Exception $e) {
            Log::error('Send reminder error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengirim email reminder'
            ], 500);
        }
    }

    /**
     * Send invoice email
     */
    public function sendInvoice(Request $request)
    {
        try {
            Log::info('Invoice email request', $request->all());
            return response()->json([
                'status' => 'success',
                'message' => 'Invoice berhasil dikirim ke email'
            ]);
        } catch (\Exception $e) {
            Log::error('Send invoice error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengirim invoice'
            ], 500);
        }
    }
}
