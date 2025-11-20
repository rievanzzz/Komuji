<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ContactMessage;
use App\Models\User;

class ContactMessageController extends Controller
{
    /**
     * Public endpoint to store a contact message
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:120',
            'email' => 'required|email|max:191',
            'subject' => 'required|string|max:191',
            'message' => 'required|string|max:5000',
        ]);

        $msg = ContactMessage::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'subject' => $validated['subject'],
            'message' => $validated['message'],
            'status' => 'new',
        ]);

        // Optionally auto-assign to specific admin if exists
        $admin = User::where('email', 'tampuphany')->orWhere('name', 'tampuphany')->first();
        if ($admin) {
            $msg->handled_by = $admin->id;
            $msg->save();
        }

        return response()->json([
            'message' => 'Pesan berhasil dikirim',
            'data' => $msg,
        ], 201);
    }

    /**
     * Admin: list messages with simple filters
     */
    public function index(Request $request)
    {
        $query = ContactMessage::query()
            ->orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }
        if ($request->filled('search')) {
            $s = $request->string('search');
            $query->where(function($q) use ($s) {
                $q->where('name', 'like', "%$s%")
                  ->orWhere('email', 'like', "%$s%")
                  ->orWhere('subject', 'like', "%$s%")
                  ->orWhere('message', 'like', "%$s%");
            });
        }

        $messages = $query->paginate($request->integer('per_page', 20));

        return response()->json($messages);
    }

    /**
     * Admin: update status/notes/handler
     */
    public function update(Request $request, ContactMessage $contactMessage)
    {
        $validated = $request->validate([
            'status' => 'sometimes|in:new,read,archived',
            'admin_notes' => 'sometimes|nullable|string',
            'handled_by' => 'sometimes|nullable|exists:users,id',
        ]);

        $contactMessage->fill($validated);
        if ($request->filled('status') && $request->string('status') === 'read' && !$contactMessage->handled_at) {
            $contactMessage->handled_at = now();
        }
        $contactMessage->save();

        return response()->json([
            'message' => 'Pesan diperbarui',
            'data' => $contactMessage,
        ]);
    }

    /**
     * Admin: delete message
     */
    public function destroy(ContactMessage $contactMessage)
    {
        $contactMessage->delete();
        return response()->json(['message' => 'Pesan dihapus']);
    }
}
