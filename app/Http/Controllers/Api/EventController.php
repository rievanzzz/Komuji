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
use Illuminate\Database\Eloquent\Model;

class EventController extends Controller
{
    /**
     * Check if the given attribute is a date or datetime attribute.
     *
     * @param  \Illuminate\Database\Eloquent\Model  $model
     * @param  string  $key
     * @return bool
     */
    protected function isDateAttribute(Model $model, $key)
    {
        return in_array($key, $model->getDates()) || 
               isset($model->getCasts()[$key]) && in_array($model->getCasts()[$key], ['date', 'datetime', 'immutable_date', 'immutable_datetime']);
    }
    public function index(Request $request)
    {
        $query = Event::query()
            ->with('category')
            ->when($request->has('search'), function($q) use ($request) {
                $search = $request->search;
                $q->where('judul', 'like', "%{$search}%")
                  ->orWhere('deskripsi', 'like', "%{$search}%")
                  ->orWhere('lokasi', 'like', "%{$search}%");
            })
            ->when($request->has('sort'), function($q) use ($request) {
                switch ($request->sort) {
                    case 'tickets_sold':
                        $q->orderBy('terdaftar', 'desc');
                        break;
                    case 'quota_remaining':
                        $q->orderByRaw('(kuota - terdaftar) DESC');
                        break;
                    case 'popularity':
                        // Sort by a combination of tickets sold and recency
                        $q->orderByRaw('(terdaftar * 0.7 + DATEDIFF(NOW(), created_at) * -0.3) DESC');
                        break;
                    case 'terdekat':
                        $q->orderBy('tanggal_mulai');
                        break;
                    case 'terpopuler':
                    default:
                        $q->orderBy('terdaftar', 'desc');
                        break;
                }
            }, function($q) {
                $q->orderBy('terdaftar', 'desc'); // Default to most popular
            })
            ->when($request->has('organizer') && $request->organizer === 'true', function($q) {
                // For organizer view, show only events created by the authenticated user
                if (auth()->check()) {
                    $q->where('created_by', auth()->id());
                }
            }, function($q) {
                // For public view, only show published events
                $q->where('is_published', true);
            });

        $events = $query->paginate($request->get('per_page', 12));

        // Transform the data to include additional fields for frontend
        $events->getCollection()->transform(function ($event) use ($request) {
            // For organizer view, return full event data
            if ($request->has('organizer') && $request->organizer === 'true') {
                return [
                    'id' => $event->id,
                    'kategori_id' => $event->kategori_id,
                    'harga_tiket' => $event->harga_tiket,
                    'created_by' => $event->created_by,
                    'judul' => $event->judul,
                    'deskripsi' => $event->deskripsi,
                    'tanggal_mulai' => $event->tanggal_mulai ? $event->tanggal_mulai->format('Y-m-d') : null,
                    'tanggal_selesai' => $event->tanggal_selesai ? $event->tanggal_selesai->format('Y-m-d') : null,
                    'waktu_mulai' => $event->waktu_mulai ? $event->waktu_mulai->format('H:i:s') : null,
                    'waktu_selesai' => $event->waktu_selesai ? $event->waktu_selesai->format('H:i:s') : null,
                    'lokasi' => $event->lokasi,
                    'flyer_path' => $event->flyer_path,
                    'sertifikat_template_path' => $event->sertifikat_template_path,
                    'is_published' => $event->is_published,
                    'approval_type' => $event->approval_type,
                    'kuota' => $event->kuota,
                    'terdaftar' => $event->terdaftar,
                    'created_at' => $event->created_at ? $event->created_at->toISOString() : null,
                    'updated_at' => $event->updated_at ? $event->updated_at->toISOString() : null,
                    'full_flyer_path' => $event->full_flyer_path,
                    'full_template_path' => $event->full_template_path,
                ];
            }
            
            // For public view, return formatted data
            return [
                'id' => $event->id,
                'title' => $event->judul,
                'date' => $event->tanggal_mulai ? $event->tanggal_mulai->format('M d, Y') : null,
                'location' => $event->lokasi,
                'price' => $event->harga_tiket ? 'From $' . number_format($event->harga_tiket, 0) : 'Free',
                'image' => $event->flyer_path ? asset('storage/' . $event->flyer_path) : 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&h=200&fit=crop',
                'category' => $event->category ? $event->category->name : 'General',
                'ticketsSold' => $event->terdaftar,
                'totalQuota' => $event->kuota,
                'popularity' => $this->getPopularityStatus($event),
                'description' => $event->deskripsi,
                'start_time' => $event->waktu_mulai,
                'end_time' => $event->waktu_selesai,
                'end_date' => $event->tanggal_selesai ? $event->tanggal_selesai->format('M d, Y') : null,
            ];
        });

        return response()->json($events);
    }

    private function getPopularityStatus($event)
    {
        $soldPercentage = $event->kuota > 0 ? ($event->terdaftar / $event->kuota) * 100 : 0;
        
        if ($soldPercentage >= 80) {
            return 'trending';
        } elseif ($soldPercentage >= 50) {
            return 'hot';
        } else {
            return 'popular';
        }
    }

    public function show(Event $event)
    {
        $user = auth()->user();
        
        // Check if user can view this event
        // Public users can only see published events
        // Organizers can see their own events regardless of publication status
        // Admins can see all events
        if (!$event->is_published && 
            (!$user || ($user->role !== 'admin' && $event->created_by !== $user->id))) {
            return response()->json(['message' => 'Event tidak ditemukan'], 404);
        }

        // Load relationships and return full event data for organizers/admins
        $eventData = $event->load(['category', 'registrations.user', 'registrations.attendance']);
        
        // For organizers viewing their own events, return detailed data
        if ($user && ($user->role === 'admin' || $event->created_by === $user->id)) {
            return response()->json([
                'data' => [
                    'id' => $event->id,
                    'kategori_id' => $event->kategori_id,
                    'harga_tiket' => $event->harga_tiket,
                    'created_by' => $event->created_by,
                    'judul' => $event->judul,
                    'deskripsi' => $event->deskripsi,
                    'tanggal_mulai' => $event->tanggal_mulai ? $event->tanggal_mulai->format('Y-m-d') : null,
                    'tanggal_selesai' => $event->tanggal_selesai ? $event->tanggal_selesai->format('Y-m-d') : null,
                    'waktu_mulai' => $event->waktu_mulai ? $event->waktu_mulai->format('H:i:s') : null,
                    'waktu_selesai' => $event->waktu_selesai ? $event->waktu_selesai->format('H:i:s') : null,
                    'lokasi' => $event->lokasi,
                    'flyer_path' => $event->flyer_path,
                    'sertifikat_template_path' => $event->sertifikat_template_path,
                    'is_published' => $event->is_published,
                    'approval_type' => $event->approval_type,
                    'kuota' => $event->kuota,
                    'terdaftar' => $event->terdaftar,
                    'created_at' => $event->created_at ? $event->created_at->toISOString() : null,
                    'updated_at' => $event->updated_at ? $event->updated_at->toISOString() : null,
                    'full_flyer_path' => $event->full_flyer_path,
                    'full_template_path' => $event->full_template_path,
                    'category' => $event->category,
                    'registrations_count' => $event->registrations->count(),
                    'approved_registrations_count' => $event->registrations->where('status', 'approved')->count(),
                    'pending_registrations_count' => $event->registrations->where('status', 'pending')->count(),
                ]
            ]);
        }
        
        // For public view, return basic event data
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

            // Normalisasi tanggal dan waktu
            if (!empty($data['tanggal_mulai'])) {
                $data['tanggal_mulai'] = \Carbon\Carbon::parse($data['tanggal_mulai'])->format('Y-m-d');
            }
            if (!empty($data['tanggal_selesai'])) {
                $data['tanggal_selesai'] = \Carbon\Carbon::parse($data['tanggal_selesai'])->format('Y-m-d');
            }
            if (!empty($data['waktu_mulai'])) {
                $data['waktu_mulai'] = \Carbon\Carbon::parse($data['waktu_mulai'])->format('H:i:s');
            }
            if (!empty($data['waktu_selesai'])) {
                $data['waktu_selesai'] = \Carbon\Carbon::parse($data['waktu_selesai'])->format('H:i:s');
            }

            // Defaults aman
            $data['terdaftar'] = $data['terdaftar'] ?? 0;
            $data['is_published'] = $data['is_published'] ?? false;
            $data['approval_type'] = $data['approval_type'] ?? 'auto';
            if (auth()->check()) {
                $data['created_by'] = auth()->id();
            }
            
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
    /**
     * Check if two values are equal, with special handling for dates and times
     */
    protected function valuesAreEqual($a, $b, $key = null)
    {
        // Handle null values
        if (is_null($a) && is_null($b)) {
            return true;
        }
        
        // Handle date comparisons
        if ($a instanceof \DateTime || $b instanceof \DateTime || 
            in_array($key, ['tanggal_mulai', 'tanggal_selesai', 'waktu_mulai', 'waktu_selesai', 'created_at', 'updated_at'])) {
            try {
                $dateA = $a instanceof \DateTime ? $a : \Carbon\Carbon::parse($a);
                $dateB = $b instanceof \DateTime ? $b : \Carbon\Carbon::parse($b);
                return $dateA->equalTo($dateB);
            } catch (\Exception $e) {
                // If parsing fails, do a string comparison
                return (string)$a === (string)$b;
            }
        }
        
        // Handle numeric comparisons
        if (is_numeric($a) && is_numeric($b)) {
            return (float)$a === (float)$b;
        }
        
        // Handle boolean comparisons
        if (is_bool($a) || is_bool($b)) {
            return (bool)$a === (bool)$b;
        }
        
        // Default string comparison
        return (string)$a === (string)$b;
    }
    
    public function update(UpdateEventRequest $request, Event $event)
    {
        try {
            // Check authorization using policy
            $this->authorize('update', $event);
            
            $data = $request->validated();
            
            // Debug log the current data and request data
            \Log::debug('=== UPDATE DEBUG START ===');
            \Log::debug('Current Event ID: ' . $event->id);
            \Log::debug('Current Event Data:', $event->toArray());
            // Raw request diagnostics
            \Log::debug('Raw input (all):', $request->all());
            \Log::debug('Validated data:', $data);
            \Log::debug('Request headers:', $request->headers->all());
            \Log::debug('Content-Type header:', [$request->header('Content-Type')]);
            \Log::debug('Raw body:', ['content' => $request->getContent()]);
            
            // Jika validated() kosong, ambil payload dari berbagai sumber agar tetap bisa update
            if (empty($data)) {
                // Ambil daftar kolom yang dapat diisi dari model sebagai allowed keys
                $modelFillable = method_exists($event, 'getFillable') ? $event->getFillable() : [];
                $fallbackAllowed = [
                    'judul','deskripsi','tanggal_mulai','tanggal_selesai','waktu_mulai','waktu_selesai',
                    'lokasi','kuota','kategori_id','harga_tiket','is_published','approval_type','flyer','sertifikat_template'
                ];
                $allowed = array_values(array_unique(array_filter(array_merge($modelFillable, $fallbackAllowed))));
                $fromAll = $request->all();
                $fromJson = $request->json()->all();
                // Unwrap jika payload terbungkus key 'data'
                if (isset($fromJson['data']) && is_array($fromJson['data'])) {
                    $fromJson = $fromJson['data'];
                }
                $raw = $request->getContent();
                $fromRaw = [];
                if (is_string($raw) && strlen(trim($raw)) > 0) {
                    $decoded = json_decode($raw, true);
                    if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                        if (isset($decoded['data']) && is_array($decoded['data'])) {
                            $decoded = $decoded['data'];
                        }
                        $fromRaw = $decoded;
                    }
                }
                $fromPost = $request->post();
                $candidates = [
                    'all' => array_intersect_key($fromAll, array_flip($allowed)),
                    'json' => array_intersect_key($fromJson, array_flip($allowed)),
                    'raw' => array_intersect_key($fromRaw, array_flip($allowed)),
                    'post' => array_intersect_key($fromPost, array_flip($allowed)),
                    'only' => $request->only($allowed),
                ];
                $best = [];
                $bestSource = null;
                foreach ($candidates as $src => $arr) {
                    if (!empty($arr) && count($arr) > count($best)) {
                        $best = $arr;
                        $bestSource = $src;
                    }
                }
                $data = $best;
                \Log::warning('update(): validated() kosong, fallback terpakai', [
                    'picked_source' => $bestSource,
                    'counts' => [
                        'all' => count($candidates['all']),
                        'json' => count($candidates['json']),
                        'raw' => count($candidates['raw']),
                        'post' => count($candidates['post']),
                        'only' => count($candidates['only'])
                    ],
                    'final' => $data
                ]);
            }
            
            // Check if there are any changes
            $hasChanges = false;
            $changes = [];
            
            // Format tanggal dan waktu sesuai dengan format database
            $dateFields = ['tanggal_mulai', 'tanggal_selesai'];
            $timeFields = ['waktu_mulai', 'waktu_selesai'];
            
            foreach ($dateFields as $field) {
                if (isset($data[$field]) && !empty($data[$field])) {
                    $data[$field] = \Carbon\Carbon::parse($data[$field])->format('Y-m-d');
                }
            }
            
            foreach ($timeFields as $field) {
                if (isset($data[$field]) && !empty($data[$field])) {
                    $data[$field] = \Carbon\Carbon::parse($data[$field])->format('H:i:s');
                }
            }
            
            // Check each field for changes
            foreach ($data as $key => $newValue) {
                // Skip file fields as they're handled separately
                if ($key === 'flyer' || $key === 'sertifikat_template') {
                    continue;
                }
                
                // Get the current value from the model
                $currentValue = $event->$key;
                
                // Convert dates to string for comparison
                if ($currentValue instanceof \DateTime) {
                    if (in_array($key, $dateFields)) {
                        $currentValue = $currentValue->format('Y-m-d');
                    } elseif (in_array($key, $timeFields)) {
                        $currentValue = $currentValue->format('H:i:s');
                    }
                }
                
                // Log the values being compared
                \Log::debug(sprintf(
                    'Comparing %s: [%s] (%s) vs [%s] (%s)',
                    $key,
                    var_export($currentValue, true),
                    gettype($currentValue),
                    var_export($newValue, true),
                    gettype($newValue)
                ));
                
                // Check if values are equal with special handling
                if ($currentValue == $newValue) {
                    \Log::debug('Values are equal');
                    unset($data[$key]); // Remove unchanged fields
                    continue;
                }
                
                // If we get here, the values are different
                $changes[$key] = [
                    'old' => $currentValue,
                    'new' => $newValue
                ];
                $hasChanges = true;
                \Log::debug('Values are different - marking as changed');
            }
            
            // Handle file uploads
            if ($request->hasFile('flyer')) {
                $changes['flyer'] = ['changed' => true];
                $hasChanges = true;
                
                // Delete old flyer if exists
                if ($event->flyer_path) {
                    Storage::disk('public')->delete($event->flyer_path);
                }
                $data['flyer_path'] = $request->file('flyer')->store('events/flyers', 'public');
                \Log::debug('Uploaded new flyer: ' . $data['flyer_path']);
            }
            
            if ($request->hasFile('sertifikat_template')) {
                $changes['sertifikat_template'] = ['changed' => true];
                $hasChanges = true;
                
                // Delete old template if exists
                if ($event->sertifikat_template_path) {
                    Storage::disk('public')->delete($event->sertifikat_template_path);
                }
                $data['sertifikat_template_path'] = $request->file('sertifikat_template')
                    ->store('events/certificate_templates', 'public');
                \Log::debug('Uploaded new certificate template: ' . $data['sertifikat_template_path']);
            }
            
            // Log the final changes
            \Log::debug('Detected changes:', $changes);
            \Log::debug('Has changes: ' . ($hasChanges ? 'true' : 'false'));
            \Log::debug('Data to update:', $data);
            
            // If no changes, return early
            if (!$hasChanges && empty($changes)) {
                \Log::debug('No changes detected, returning early');
                return response()->json([
                    'message' => 'Tidak ada perubahan yang dilakukan',
                    'data' => $event->fresh()->load('category'),
                    'success' => true,
                    'changes' => []
                ]);
            }
            
            try {
                DB::beginTransaction();
                
                // Update file paths if they were set
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
                
                \Log::debug('Updating event with data:', $data);
                
                // Update the event with the prepared data
                $event->update($data);
                
                // Refresh the model to get updated data
                $event = $event->fresh();
                
                DB::commit();
                \Log::debug('Event updated successfully');
                \Log::debug('Updated event data:', $event->toArray());
                
                return response()->json([
                    'message' => 'Event berhasil diperbarui',
                    'data' => $event->load('category'),
                    'success' => true,
                    'changes' => $changes
                ]);
                
            } catch (\Exception $e) {
                DB::rollBack();
                \Log::error('Error updating event: ' . $e->getMessage());
                \Log::error($e->getTraceAsString());
                throw $e;
            }
            
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Anda tidak memiliki izin untuk memperbarui event ini',
                'success' => false
            ], 403);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Terjadi kesalahan saat memperbarui event',
                'error' => config('app.debug') ? $e->getMessage() : null,
                'success' => false
            ], 500);
        }
    }

    /**
     * Remove the specified event from storage.
     */
    public function destroy(Event $event)
    {
        try {
            // Check authorization using policy
            $this->authorize('delete', $event);
            
            // Prevent deletion if there are registrations
            if ($event->registrations()->exists()) {
                return response()->json([
                    'message' => 'Tidak dapat menghapus event yang sudah memiliki pendaftaran',
                    'success' => false
                ], 422);
            }
            
            // Delete associated files
            if ($event->flyer_path) {
                \Storage::disk('public')->delete($event->flyer_path);
            }
            
            if ($event->sertifikat_template_path) {
                \Storage::disk('public')->delete($event->sertifikat_template_path);
            }
            
            // Soft delete the event
            $event->delete();
            
            return response()->json([
                'message' => 'Event berhasil dihapus',
                'success' => true
            ]);
            
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return response()->json([
                'message' => 'Anda tidak memiliki izin untuk menghapus event ini',
                'success' => false
            ], 403);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat menghapus event',
                'error' => config('app.debug') ? $e->getMessage() : null,
                'success' => false
            ], 500);
        }
    }
    
    /**
     * Get all registrations for an event.
     */
    public function registrations(Event $event)
    {
        // Check authorization using policy
        $this->authorize('view', $event);
        
        $user = auth()->user();
        
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