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
