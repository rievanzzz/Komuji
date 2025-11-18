<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Event;
use App\Models\Registration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AttendanceController extends Controller
{
    public function verify(Request $request, Event $event)
    {
        $request->validate([
            'token' => 'required|string|max:100'
        ]);

        // Authorization: admin or event creator only
        $user = auth()->user();
        if (!($user->role === 'admin' || $event->created_by === $user->id)) {
            return response()->json([
                'message' => 'Unauthorized. Hanya admin atau pembuat event yang dapat memverifikasi absensi.'
            ], 403);
        }

        // Only for certificate-enabled events
        if (!$event->has_certificate) {
            return response()->json([
                'message' => 'Absensi hanya tersedia untuk event bersertifikat.'
            ], 400);
        }

        $token = $request->input('token');

        $attendance = Attendance::query()
            ->where('token', $token)
            ->with(['registration.user', 'registration.event'])
            ->first();

        if (!$attendance || $attendance->registration->event_id !== $event->id) {
            return response()->json([
                'message' => 'Token tidak valid untuk event ini'
            ], 404);
        }

        // Time restriction: only on event day and within event hours
        try {
            $startDate = $event->tanggal_mulai ? \Carbon\Carbon::parse($event->tanggal_mulai)->format('Y-m-d') : now()->format('Y-m-d');
            $endDate = $event->tanggal_selesai ? \Carbon\Carbon::parse($event->tanggal_selesai)->format('Y-m-d') : $startDate;

            $startTime = $event->waktu_mulai ? \Carbon\Carbon::parse($event->waktu_mulai)->format('H:i:s') : '00:00:00';
            $endTime = $event->waktu_selesai ? \Carbon\Carbon::parse($event->waktu_selesai)->format('H:i:s') : '23:59:59';

            $eventStart = \Carbon\Carbon::parse($startDate.' '.$startTime);
            $eventEnd = \Carbon\Carbon::parse($endDate.' '.$endTime);

            $now = now();
            if (!$now->between($eventStart, $eventEnd)) {
                return response()->json([
                    'message' => 'Absensi hanya dapat dilakukan pada tanggal dan jam event.',
                    'event_time' => [
                        'start' => $eventStart->format('Y-m-d H:i:s'),
                        'end' => $eventEnd->format('Y-m-d H:i:s'),
                        'now' => $now->format('Y-m-d H:i:s'),
                    ]
                ], 400);
            }
        } catch (\Exception $e) {
            Log::warning('Failed to parse event time for attendance verification: '.$e->getMessage());
        }

        DB::beginTransaction();
        try {
            $now = now();
            $statusBefore = $attendance->status;

            if ($attendance->status === 'pending') {
                $attendance->update([
                    'status' => 'checked_in',
                    'check_in_time' => $now,
                ]);
                $attendance->registration->update(['is_attended' => true]);
                $statusAfter = 'checked_in';
                $message = 'Check-in berhasil';
            } elseif ($attendance->status === 'checked_in') {
                $attendance->update([
                    'status' => 'checked_out',
                    'check_out_time' => $now,
                ]);
                $statusAfter = 'checked_out';
                $message = 'Check-out berhasil';
            } else {
                DB::rollBack();
                return response()->json([
                    'message' => 'Peserta sudah menyelesaikan absensi (checked out)'
                ], 400);
            }

            DB::commit();

            return response()->json([
                'message' => $message,
                'status_before' => $statusBefore,
                'status_after' => $statusAfter,
                'participant' => [
                    'name' => $attendance->registration->user->name ?? null,
                    'email' => $attendance->registration->user->email ?? null,
                ],
                'times' => [
                    'check_in_time' => optional($attendance->check_in_time)->format('Y-m-d H:i:s'),
                    'check_out_time' => optional($attendance->check_out_time)->format('Y-m-d H:i:s'),
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Verify attendance error: '.$e->getMessage());
            return response()->json([
                'message' => 'Gagal memverifikasi absensi',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    public function stats(Event $event)
    {
        $user = auth()->user();
        if (!($user->role === 'admin' || $event->created_by === $user->id)) {
            return response()->json([
                'message' => 'Unauthorized. Hanya admin atau pembuat event yang dapat melihat statistik.'
            ], 403);
        }

        $registrations = Registration::where('event_id', $event->id)
            ->with(['attendance', 'user:id,name,email'])
            ->get();

        $total = $registrations->count();
        $checkedIn = $registrations->where('attendance.status', 'checked_in')->count();
        $checkedOut = $registrations->where('attendance.status', 'checked_out')->count();
        $pending = $registrations->where('attendance', null)->count()
            + $registrations->where('attendance.status', 'pending')->count();

        $list = $registrations->map(function ($reg) {
            return [
                'id' => $reg->id,
                'name' => $reg->user->name ?? null,
                'email' => $reg->user->email ?? null,
                'status' => $reg->attendance->status ?? 'pending',
                'check_in_time' => optional($reg->attendance->check_in_time ?? null)->format('Y-m-d H:i:s'),
                'check_out_time' => optional($reg->attendance->check_out_time ?? null)->format('Y-m-d H:i:s'),
                'token' => $reg->attendance->token ?? null,
            ];
        });

        return response()->json([
            'event_id' => $event->id,
            'summary' => [
                'total' => $total,
                'checked_in' => $checkedIn,
                'checked_out' => $checkedOut,
                'pending' => $pending,
            ],
            'data' => $list,
        ]);
    }
}
