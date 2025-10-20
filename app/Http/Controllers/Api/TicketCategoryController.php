<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\TicketCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TicketCategoryController extends Controller
{
    /**
     * Get ticket categories for an event
     */
    public function index(Event $event)
    {
        $categories = $event->ticketCategories()
            ->where('is_active', true)
            ->orderBy('harga')
            ->get();

        return response()->json($categories);
    }

    /**
     * Store a new ticket category for an event
     */
    public function store(Request $request, Event $event)
    {
        $request->validate([
            'nama_kategori' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'harga' => 'required|numeric|min:0',
            'kuota' => 'required|integer|min:1',
        ]);

        // Check if user owns the event
        if ($event->created_by !== auth()->id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 403);
        }

        // Enforce quota constraints: category quota must not exceed remaining event quota
        $totalExistingQuota = $event->ticketCategories()->sum('kuota');
        $remainingQuota = max(0, (int)$event->kuota - (int)$totalExistingQuota);

        if ((int)$request->kuota > $remainingQuota) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kuota kategori melebihi sisa kuota event',
                'detail' => [
                    'event_kuota' => (int)$event->kuota,
                    'total_kategori' => (int)$totalExistingQuota,
                    'sisa_event' => $remainingQuota,
                    'kuota_diminta' => (int)$request->kuota,
                ]
            ], 422);
        }

        $category = $event->ticketCategories()->create([
            'nama_kategori' => $request->nama_kategori,
            'deskripsi' => $request->deskripsi,
            'harga' => $request->harga,
            'kuota' => $request->kuota,
            'terjual' => 0,
            'is_active' => true
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Kategori tiket berhasil dibuat',
            'data' => $category
        ], 201);
    }

    /**
     * Update a ticket category
     */
    public function update(Request $request, Event $event, TicketCategory $ticketCategory)
    {
        $request->validate([
            'nama_kategori' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'harga' => 'required|numeric|min:0',
            'kuota' => 'required|integer|min:' . $ticketCategory->terjual,
        ]);

        // Check if user owns the event
        if ($event->created_by !== auth()->id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 403);
        }

        // Check if category belongs to event
        if ($ticketCategory->event_id !== $event->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kategori tiket tidak ditemukan'
            ], 404);
        }

        // Enforce quota constraints on update
        $totalOtherCategories = $event->ticketCategories()
            ->where('id', '!=', $ticketCategory->id)
            ->sum('kuota');
        $maxAllowedForThis = max(0, (int)$event->kuota - (int)$totalOtherCategories);

        if ((int)$request->kuota > $maxAllowedForThis) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kuota kategori melebihi kuota event',
                'detail' => [
                    'event_kuota' => (int)$event->kuota,
                    'total_kategori_lain' => (int)$totalOtherCategories,
                    'maks_untuk_kategori_ini' => $maxAllowedForThis,
                    'kuota_diminta' => (int)$request->kuota,
                ]
            ], 422);
        }

        $ticketCategory->update([
            'nama_kategori' => $request->nama_kategori,
            'deskripsi' => $request->deskripsi,
            'harga' => $request->harga,
            'kuota' => $request->kuota,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Kategori tiket berhasil diupdate',
            'data' => $ticketCategory
        ]);
    }

    /**
     * Delete a ticket category
     */
    public function destroy(Event $event, TicketCategory $ticketCategory)
    {
        // Check if user owns the event
        if ($event->created_by !== auth()->id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 403);
        }

        // Check if category belongs to event
        if ($ticketCategory->event_id !== $event->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kategori tiket tidak ditemukan'
            ], 404);
        }

        // Check if there are any registrations
        if ($ticketCategory->terjual > 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'Tidak dapat menghapus kategori tiket yang sudah memiliki peserta'
            ], 400);
        }

        $ticketCategory->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Kategori tiket berhasil dihapus'
        ]);
    }
}
