<?php

namespace App\Http\Controllers\Test;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class EventTestController extends Controller
{
    /**
     * Debug method to test event update functionality
     */
    public function debugUpdate($id)
    {
        try {
            $event = Event::findOrFail($id);
            
            // Log the current state of the event
            Log::info('Current event data:', $event->toArray());
            
            // Create a test update request
            $requestData = [
                'judul' => 'Updated Test Event ' . now()->format('H:i:s'),
                'deskripsi' => 'This is an updated test event',
                'tanggal_mulai' => '2025-01-01',
                'tanggal_selesai' => '2025-01-02',
                'waktu_mulai' => '09:00:00',
                'waktu_selesai' => '17:00:00',
                'lokasi' => 'Test Location Updated',
                'kuota' => 100,
                'is_published' => true,
                'kategori_id' => 1,
                'harga_tiket' => '0.00',
                'approval_type' => 'auto'
            ];
            
            // Log the update data
            Log::info('Update data:', $requestData);
            
            // Check each field for changes
            $changes = [];
            $hasChanges = false;
            
            foreach ($requestData as $key => $newValue) {
                $currentValue = $event->$key;
                
                // Log the comparison
                Log::info(sprintf(
                    'Comparing %s: [%s] (%s) vs [%s] (%s)',
                    $key,
                    var_export($currentValue, true),
                    gettype($currentValue),
                    var_export($newValue, true),
                    gettype($newValue)
                ));
                
                // Simple strict comparison first
                if ($currentValue === $newValue) {
                    Log::debug('Values are identical (===)');
                    continue;
                }
                
                // If not strictly equal, try loose comparison
                if ($currentValue == $newValue) {
                    Log::debug('Values are equal but not identical (==)');
                    continue;
                }
                
                // For string values, compare trimmed versions
                if (is_string($currentValue) && is_string($newValue)) {
                    if (trim($currentValue) === trim($newValue)) {
                        Log::debug('String values match after trimming');
                        continue;
                    }
                }
                
                // If we get here, the values are different
                $changes[$key] = [
                    'old' => $currentValue,
                    'new' => $newValue
                ];
                $hasChanges = true;
                Log::info('Values are different - marking as changed');
            }
            
            Log::info('Detected changes:', $changes);
            
            if (!$hasChanges) {
                return response()->json([
                    'message' => 'No changes detected',
                    'success' => true,
                    'changes' => []
                ]);
            }
            
            // Update the event
            $event->update($requestData);
            
            return response()->json([
                'message' => 'Event updated successfully',
                'success' => true,
                'changes' => $changes,
                'event' => $event->fresh()
            ]);
            
        } catch (\Exception $e) {
            Log::error('Debug update error: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            
            return response()->json([
                'message' => 'Error: ' . $e->getMessage(),
                'success' => false,
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }
    
    public function create()
    {
        $categories = Category::all();
        Log::info('Categories loaded:', $categories->toArray());
        return view('test.create_event', compact('categories'));
    }

    public function edit($id)
    {
        $event = Event::findOrFail($id);
        $categories = Category::all();
        return view('test.edit_event', compact('event', 'categories'));
    }

    public function update(Request $request, $id)
    {
        Log::info('Update event form submitted with data:', $request->except(['flyer', 'sertifikat_template']));
        
        try {
            $event = Event::findOrFail($id);
            
            $validated = $request->validate([
                'judul' => 'required|string|max:255',
                'deskripsi' => 'required|string',
                'kategori_id' => 'required|exists:categories,id',
                'harga_tiket' => 'required|numeric|min:0',
                'tanggal_mulai' => 'required|date',
                'tanggal_selesai' => 'required|date|after_or_equal:tanggal_mulai',
                'waktu_mulai' => 'required|date_format:H:i',
                'waktu_selesai' => 'required|date_format:H:i|after:waktu_mulai',
                'lokasi' => 'required|string|max:255',
                'kuota' => 'required|integer|min:1',
                'approval_type' => 'required|in:auto,manual',
                'flyer' => 'sometimes|image|mimes:jpeg,png,jpg|max:2048',
                'sertifikat_template' => 'nullable|file|mimes:pdf,doc,docx|max:5120',
                'is_published' => 'sometimes|boolean'
            ]);
            
            DB::beginTransaction();
            
            try {
                $eventData = [
                    'judul' => $validated['judul'],
                    'deskripsi' => $validated['deskripsi'],
                    'kategori_id' => $validated['kategori_id'],
                    'harga_tiket' => $validated['harga_tiket'],
                    'tanggal_mulai' => $validated['tanggal_mulai'],
                    'tanggal_selesai' => $validated['tanggal_selesai'],
                    'waktu_mulai' => $validated['waktu_mulai'],
                    'waktu_selesai' => $validated['waktu_selesai'],
                    'lokasi' => $validated['lokasi'],
                    'kuota' => $validated['kuota'],
                    'approval_type' => $validated['approval_type'],
                    'is_published' => $request->boolean('is_published')
                ];
                
                // Handle flyer update if new file is uploaded
                if ($request->hasFile('flyer')) {
                    // Delete old flyer
                    if ($event->flyer_path && Storage::disk('public')->exists($event->flyer_path)) {
                        Storage::disk('public')->delete($event->flyer_path);
                    }
                    $flyerPath = $request->file('flyer')->store('events/flyers', 'public');
                    $eventData['flyer_path'] = str_replace('public/', '', $flyerPath);
                }
                
                // Handle certificate template update if new file is uploaded
                if ($request->hasFile('sertifikat_template')) {
                    // Delete old certificate template
                    if ($event->sertifikat_template_path && Storage::disk('public')->exists($event->sertifikat_template_path)) {
                        Storage::disk('public')->delete($event->sertifikat_template_path);
                    }
                    $sertifikatPath = $request->file('sertifikat_template')->store('events/certificate_templates', 'public');
                    $eventData['sertifikat_template_path'] = str_replace('public/', '', $sertifikatPath);
                }
                
                $event->update($eventData);
                
                DB::commit();
                
                return redirect()->route('test.events.edit', $event->id)
                    ->with('success', 'Event berhasil diperbarui!');
                    
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }
            
        } catch (\Exception $e) {
            Log::error('Error updating event: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            
            return back()->withInput()
                ->with('error', 'Terjadi kesalahan saat memperbarui event. ' . $e->getMessage());
        }
    }
    
    public function store(Request $request)
    {
        Log::info('Form submitted with data:', $request->except(['flyer', 'sertifikat_template']));
        
        try {
            // Validate the request
            $validated = $request->validate([
                'judul' => 'required|string|max:255',
                'deskripsi' => 'required|string',
                'kategori_id' => 'required|exists:categories,id',
                'harga_tiket' => 'required|numeric|min:0',
                'tanggal_mulai' => 'required|date|after_or_equal:' . now()->addDays(3)->format('Y-m-d'),
                'tanggal_selesai' => 'required|date|after_or_equal:tanggal_mulai',
                'waktu_mulai' => 'required|date_format:H:i',
                'waktu_selesai' => 'required|date_format:H:i|after:waktu_mulai',
                'lokasi' => 'required|string|max:255',
                'kuota' => 'required|integer|min:1',
                'approval_type' => 'required|in:auto,manual',
                'flyer' => 'required|image|mimes:jpeg,png,jpg|max:2048',
                'sertifikat_template' => 'nullable|file|mimes:pdf,doc,docx|max:5120',
                'is_published' => 'sometimes|boolean'
            ]);
            Log::info('Validation passed');

            // Handle file uploads
            $flyerPath = $request->file('flyer')->store('events/flyers', 'public');
            $flyerPath = str_replace('public/', '', $flyerPath); // Remove 'public/' from path
            Log::info('Flyer uploaded to: ' . $flyerPath);
            
            $sertifikatPath = null;
            if ($request->hasFile('sertifikat_template')) {
                $sertifikatPath = $request->file('sertifikat_template')->store('events/certificate_templates', 'public');
                $sertifikatPath = str_replace('public/', '', $sertifikatPath); // Remove 'public/' from path
                Log::info('Certificate template uploaded to: ' . $sertifikatPath);
            }

            // Create event
            $eventData = [
                'judul' => $validated['judul'],
                'deskripsi' => $validated['deskripsi'],
                'kategori_id' => $validated['kategori_id'],
                'harga_tiket' => $validated['harga_tiket'],
                'tanggal_mulai' => $validated['tanggal_mulai'],
                'tanggal_selesai' => $validated['tanggal_selesai'],
                'waktu_mulai' => $validated['waktu_mulai'],
                'waktu_selesai' => $validated['waktu_selesai'],
                'lokasi' => $validated['lokasi'],
                'kuota' => $validated['kuota'],
                'approval_type' => $validated['approval_type'],
                'flyer_path' => $flyerPath,
                'sertifikat_template_path' => $sertifikatPath,
                'is_published' => $request->boolean('is_published'),
                'created_by' => auth()->id() ?? 1, // Default to admin if not authenticated
                'terdaftar' => 0 // Initialize terdaftar to 0
            ];
            Log::info('Attempting to create event with data:', $eventData);

            DB::beginTransaction();
            
            try {
                $event = Event::create($eventData);
                Log::info('Event created with ID: ' . $event->id);
                
                DB::commit();
                
                return redirect()->route('test.events.create')
                    ->with('success', 'Event berhasil dibuat!');
                    
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e; // Re-throw to be caught by the outer catch
            }

        } catch (\Exception $e) {
            Log::error('Error creating event: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            
            // Delete uploaded files if error occurs
            if (isset($flyerPath) && Storage::disk('public')->exists($flyerPath)) {
                Storage::disk('public')->delete($flyerPath);
            }
            if (isset($sertifikatPath) && Storage::disk('public')->exists($sertifikatPath)) {
                Storage::disk('public')->delete($sertifikatPath);
            }
            
            $errorMessage = 'Terjadi kesalahan saat membuat event. ';
            if ($e instanceof \Illuminate\Validation\ValidationException) {
                $errorMessage = 'Validasi gagal: ' . implode(' ', $e->errors());
            } else {
                $errorMessage .= $e->getMessage();
            }
            
            return back()->withInput()
                ->with('error', $errorMessage);
        }
    }
}
