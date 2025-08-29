<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Event\StoreEventRequest;
use App\Http\Requests\Event\UpdateEventRequest;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class EventController extends Controller
{
    public function index(Request $request)
    {
        $query = Event::query()
            ->when($request->has('search'), function($q) use ($request) {
                $search = $request->search;
                $q->where('judul', 'like', "%{$search}%")
                  ->orWhere('deskripsi', 'like', "%{$search}%")
                  ->orWhere('lokasi', 'like', "%{$search}%");
            })
            ->when($request->has('sort'), function($q) use ($request) {
                if ($request->sort === 'terdekat') {
                    $q->orderBy('tanggal_mulai');
                } elseif ($request->sort === 'terpopuler') {
                    $q->orderBy('terdaftar', 'desc');
                }
            }, function($q) {
                $q->orderBy('created_at', 'desc');
            })
            ->where('is_published', true);

        $events = $query->paginate(10);

        return response()->json($events);
    }

    public function show(Event $event)
    {
        if (!$event->is_published) {
            return response()->json(['message' => 'Event tidak ditemukan'], 404);
        }

        return response()->json($event->loadCount('registrations'));
    }

    /**
     * Store a newly created event in storage.
     */
    public function store(StoreEventRequest $request)
    {
        DB::beginTransaction();
        try {
            $data = $request->validated();
            $data['created_by'] = auth()->id();
            
            // Set default values
            $data['terdaftar'] = 0;
            $data['is_published'] = $data['is_published'] ?? false;
            $data['approval_type'] = $data['approval_type'] ?? 'auto';
            
            // Handle file uploads
            if ($request->hasFile('flyer')) {
                $data['flyer_path'] = $request->file('flyer')->store('events/flyers', 'public');
                if (!$data['flyer_path']) {
                    throw new \Exception('Gagal mengunggah flyer');
                }
            }
            
            if ($request->hasFile('sertifikat_template')) {
                $data['sertifikat_template_path'] = $request->file('sertifikat_template')
                    ->store('events/certificate_templates', 'public');
                if (!$data['sertifikat_template_path']) {
                    throw new \Exception('Gagal mengunggah template sertifikat');
                }
            }
            
            $event = Event::create($data);
            
            DB::commit();
            
            return response()->json([
                'message' => 'Event berhasil dibuat',
                'data' => $event->load('category')
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error creating event: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());
            
            return response()->json([
                'message' => 'Gagal membuat event: ' . $e->getMessage(),
                'error' => config('app.debug') ? $e->getTraceAsString() : null
            ], 500);
        }
    }

    /**
     * Update the specified event in storage.
     */
    public function update(UpdateEventRequest $request, Event $event)
    {
        $data = $request->validated();
        
        // Handle file uploads
        if ($request->hasFile('flyer')) {
            // Delete old flyer if exists
            if ($event->flyer_path) {
                Storage::disk('public')->delete($event->flyer_path);
            }
            $data['flyer_path'] = $request->file('flyer')->store('events/flyers', 'public');
        }
        
        if ($request->hasFile('sertifikat_template')) {
            // Delete old template if exists
            if ($event->sertifikat_template_path) {
                Storage::disk('public')->delete($event->sertifikat_template_path);
            }
            $data['sertifikat_template_path'] = $request->file('sertifikat_template')
                ->store('events/certificate_templates', 'public');
        }
        
        $event->update($data);
        
        return response()->json([
            'message' => 'Event berhasil diperbarui',
            'data' => $event->load('category')
        ]);
    }

    /**
     * Remove the specified event from storage.
     */
    public function destroy(Event $event)
    {
        // Check if user is the creator or admin
        if (auth()->user()->role !== 'admin' && $event->created_by !== auth()->id()) {
            return response()->json([
                'message' => 'Unauthorized. Anda hanya dapat menghapus event yang Anda buat.'
            ], 403);
        }
        
        // Soft delete the event
        $event->delete();
        
        return response()->json([
            'message' => 'Event berhasil dihapus'
        ]);
    }
    
    /**
     * Get all registrations for an event.
     */
    public function registrations(Event $event)
    {
        // Check if user is the creator or admin
        if (auth()->user()->role !== 'admin' && $event->created_by !== auth()->id()) {
            return response()->json([
                'message' => 'Unauthorized. Anda hanya dapat melihat peserta event yang Anda buat.'
            ], 403);
        }
        
        $registrations = $event->registrations()
            ->with(['user:id,name,email', 'attendance'])
            ->get()
            ->map(function($registration) {
                return [
                    'id' => $registration->id,
                    'user_name' => $registration->user->name,
                    'user_email' => $registration->user->email,
                    'status' => $registration->status,
                    'waktu_daftar' => $registration->created_at,
                    'kehadiran' => $registration->attendance ? [
                        'status' => $registration->attendance->is_verified ? 'Hadir' : 'Belum Hadir',
                        'waktu_hadir' => $registration->attendance->waktu_hadir,
                        'token' => $registration->attendance->token
                    ] : null
                ];
            });
            
        return response()->json([
            'data' => $registrations
        ]);
    }
    
    /**
     * Export attendance report for an event.
     */
    public function exportAttendance(Event $event)
    {
        // Check if user is the creator or admin
        if (auth()->user()->role !== 'admin' && $event->created_by !== auth()->id()) {
            return response()->json([
                'message' => 'Unauthorized. Anda hanya dapat mengekspor laporan event yang Anda buat.'
            ], 403);
        }
        
        $registrations = $event->registrations()
            ->with(['user:id,name,email', 'attendance'])
            ->get();
            
        $headers = [
            'Nama Peserta',
            'Email',
            'Status Pendaftaran',
            'Status Kehadiran',
            'Waktu Hadir',
            'Token Absensi'
        ];
        
        $data = [];
        
        foreach ($registrations as $registration) {
            $data[] = [
                $registration->user->name,
                $registration->user->email,
                ucfirst($registration->status),
                $registration->attendance ? ($registration->attendance->is_verified ? 'Hadir' : 'Tidak Hadir') : 'Belum Absen',
                $registration->attendance ? $registration->attendance->waktu_hadir : '-',
                $registration->attendance ? $registration->attendance->token : '-',
            ];
        }
        
        $filename = 'laporan_absensi_' . Str::slug($event->judul) . '_' . now()->format('Y-m-d') . '.csv';
        
        return response()->streamDownload(function() use ($headers, $data) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, $headers);
            
            foreach ($data as $row) {
                fputcsv($handle, $row);
            }
            
            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }
    }