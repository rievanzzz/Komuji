<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserManagementController extends Controller
{
    /**
     * Get all users dengan relasi dan events count
     * Endpoint: GET /api/admin/all-users
     */
    public function getAllUsers()
    {
        try {
            // Ambil semua users dengan relasi registrations
            $users = User::with(['registrations.event'])
                ->select('id', 'name', 'email', 'role', 'is_active', 'email_verified_at', 'created_at')
                ->get();

            // Map data dan tambahkan events_count
            $users = $users->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role ?? 'user',
                    'is_active' => $user->is_active ? true : false,
                    'email_verified_at' => $user->email_verified_at,
                    'created_at' => $user->created_at,
                    'events_count' => $user->registrations ? $user->registrations->count() : 0,
                    'status' => $user->email_verified_at ? 'approved' : 'pending'
                ];
            });

            return response()->json([
                'status' => 'success',
                'data' => $users
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch users',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle user active status
     * Endpoint: PATCH /api/users/{id}/toggle-status
     */
    public function toggleStatus(Request $request, $id)
    {
        try {
            $user = User::findOrFail($id);

            // Toggle status
            $user->is_active = $request->is_active ?? !$user->is_active;
            $user->save();

            return response()->json([
                'status' => 'success',
                'message' => 'User status updated successfully',
                'data' => [
                    'id' => $user->id,
                    'is_active' => $user->is_active
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update user status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete user
     * Endpoint: DELETE /api/users/{id}
     */
    public function deleteUser($id)
    {
        try {
            $user = User::findOrFail($id);

            // Cek jangan hapus admin
            if ($user->role === 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Cannot delete admin user'
                ], 403);
            }

            // Soft delete atau hard delete
            $user->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'User deleted successfully'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user events/registrations
     * Endpoint: GET /api/users/{id}/events
     */
    public function getUserEvents($id)
    {
        try {
            $user = User::with(['registrations.event'])->findOrFail($id);

            $events = $user->registrations->map(function ($registration) {
                return [
                    'id' => $registration->id,
                    'event_name' => $registration->event->nama_event ?? 'Unknown Event',
                    'event_date' => $registration->event->tanggal_mulai ?? null,
                    'status' => $registration->status ?? 'registered',
                    'registered_at' => $registration->created_at
                ];
            });

            return response()->json([
                'status' => 'success',
                'data' => $events
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch user events',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Approve organizer/panitia
     * Endpoint: POST /api/organizers/{id}/approve
     */
    public function approveOrganizer($id)
    {
        try {
            $user = User::findOrFail($id);

            // Update email_verified_at untuk approve
            $user->email_verified_at = now();
            $user->is_active = true;
            $user->save();

            return response()->json([
                'status' => 'success',
                'message' => 'Organizer approved successfully',
                'data' => [
                    'id' => $user->id,
                    'email_verified_at' => $user->email_verified_at,
                    'status' => 'approved'
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to approve organizer',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reject organizer/panitia
     * Endpoint: POST /api/organizers/{id}/reject
     */
    public function rejectOrganizer($id)
    {
        try {
            $user = User::findOrFail($id);

            // Set email_verified_at to null untuk reject
            $user->email_verified_at = null;
            $user->is_active = false;
            $user->save();

            return response()->json([
                'status' => 'success',
                'message' => 'Organizer rejected successfully',
                'data' => [
                    'id' => $user->id,
                    'status' => 'rejected'
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to reject organizer',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
