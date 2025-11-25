<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ChangePasswordRequest;
use App\Http\Requests\UpdateProfileRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    /**
     * Get authenticated user data
     */
    public function profile(): JsonResponse
    {
        $user = auth()->user();

        // Map database field names to frontend expected field names
        $userData = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->no_handphone, // Map no_handphone to phone
            'no_handphone' => $user->no_handphone, // Keep original for compatibility
            'address' => $user->alamat, // Map alamat to address
            'alamat' => $user->alamat, // Keep original for compatibility
            'last_education' => $user->pendidikan_terakhir, // Map pendidikan_terakhir to last_education
            'pendidikan_terakhir' => $user->pendidikan_terakhir, // Keep original for compatibility
            'role' => $user->role,
            'status_akun' => $user->status_akun,
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
            'email_verified_at' => $user->email_verified_at
        ];

        return response()->json([
            'status' => 'success',
            'data' => $userData
        ]);
    }

    /**
     * Update user profile
     */
    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        try {
            $user = auth()->user();
            $user->update($request->validated());

            // Return updated user data with proper field mapping
            $userData = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->no_handphone, // Map no_handphone to phone
                'no_handphone' => $user->no_handphone, // Keep original for compatibility
                'address' => $user->alamat, // Map alamat to address
                'alamat' => $user->alamat, // Keep original for compatibility
                'last_education' => $user->pendidikan_terakhir, // Map pendidikan_terakhir to last_education
                'pendidikan_terakhir' => $user->pendidikan_terakhir, // Keep original for compatibility
                'role' => $user->role,
                'status_akun' => $user->status_akun,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
                'email_verified_at' => $user->email_verified_at
            ];

            return response()->json([
                'status' => 'success',
                'message' => 'Profil berhasil diperbarui',
                'data' => $userData
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memperbarui profil',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Change user password
     */
    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        try {
            $user = auth()->user();

            // Update password
            $user->update([
                'password' => Hash::make($request->new_password)
            ]);

            // Revoke all tokens (logout all devices)
            $user->tokens()->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Password berhasil diubah. Silakan login kembali.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengubah password',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get organizer profile with panitia profile data
     */
    public function getOrganizerProfile(): JsonResponse
    {
        try {
            $user = auth()->user();
            $panitiaProfile = $user->panitiaProfile;

            if (!$panitiaProfile) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Profil panitia tidak ditemukan'
                ], 404);
            }

            $profileData = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->no_handphone,
                'organization' => $panitiaProfile->organization_name,
                'bio' => $panitiaProfile->organization_description,
                'avatar' => null, // TODO: implement avatar upload
                'role' => $user->role,
                'created_at' => $user->created_at->toISOString(),
                // Additional panitia info
                'panitia_status' => $panitiaProfile->status,
                'plan_type' => $panitiaProfile->plan_type,
                'trial_days_left' => $panitiaProfile->trial_days_left,
                'premium_days_left' => $panitiaProfile->premium_days_left,
                'max_active_events' => $panitiaProfile->max_active_events
            ];

            return response()->json([
                'status' => 'success',
                'profile' => $profileData,
                'notifications' => [
                    'email_notifications' => true,
                    'sms_notifications' => false,
                    'push_notifications' => true,
                    'marketing_emails' => false,
                    'event_reminders' => true,
                    'payment_notifications' => true
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil profil organizer',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update organizer profile
     */
    public function updateOrganizerProfile(Request $request): JsonResponse
    {
        try {
            $user = auth()->user();
            $panitiaProfile = $user->panitiaProfile;

            if (!$panitiaProfile) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Profil panitia tidak ditemukan'
                ], 404);
            }

            // Validate request
            $request->validate([
                'name' => 'sometimes|string|max:255',
                'phone' => 'sometimes|string|max:20',
                'organization' => 'sometimes|string|max:255',
                'bio' => 'sometimes|string|max:1000'
            ]);

            DB::beginTransaction();

            // Update user data
            if ($request->has('name')) {
                $user->update(['name' => $request->name]);
            }
            if ($request->has('phone')) {
                $user->update(['no_handphone' => $request->phone]);
            }

            // Update panitia profile data
            if ($request->has('organization')) {
                $panitiaProfile->update(['organization_name' => $request->organization]);
            }
            if ($request->has('bio')) {
                $panitiaProfile->update(['organization_description' => $request->bio]);
            }

            DB::commit();

            // Return updated profile
            $panitiaProfile->refresh(); // Reload from database
            $profileData = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->no_handphone,
                'organization' => $panitiaProfile->organization_name,
                'bio' => $panitiaProfile->organization_description,
                'avatar' => null,
                'role' => $user->role,
                'created_at' => $user->created_at->toISOString(),
                'panitia_status' => $panitiaProfile->status,
                'plan_type' => $panitiaProfile->plan_type,
                'trial_days_left' => $panitiaProfile->trial_days_left,
                'premium_days_left' => $panitiaProfile->premium_days_left,
                'max_active_events' => $panitiaProfile->max_active_events
            ];

            return response()->json([
                'status' => 'success',
                'message' => 'Profil berhasil diperbarui',
                'profile' => $profileData
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memperbarui profil',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get organizer earnings and transaction history
     */
    public function getOrganizerEarnings(Request $request)
    {
        $user = auth()->user();

        if (!$user->isPanitia()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akses ditolak. Hanya panitia yang dapat mengakses fitur ini.'
            ], 403);
        }

        try {
            $panitiaProfile = \App\Models\PanitiaProfile::where('user_id', $user->id)->first();

            if (!$panitiaProfile) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Profile panitia tidak ditemukan'
                ], 404);
            }

            // Get transaction history for this organizer
            $transactions = \App\Models\Transaction::with(['event', 'user'])
                ->where('type', 'event_registration')
                ->whereHas('event', function($query) use ($user) {
                    $query->where('created_by', $user->id);
                })
                ->where('status', 'paid')
                ->orderBy('paid_at', 'desc')
                ->limit(20)
                ->get()
                ->map(function ($transaction) {
                    return [
                        'id' => $transaction->id,
                        'order_id' => $transaction->order_id,
                        'event_title' => $transaction->event->judul ?? 'Unknown Event',
                        'participant_name' => $transaction->user->name ?? 'Unknown User',
                        'gross_amount' => $transaction->gross_amount,
                        'platform_fee' => $transaction->platform_fee,
                        'net_amount' => $transaction->net_amount,
                        'payment_method' => $transaction->payment_method,
                        'paid_at' => $transaction->paid_at?->format('d M Y H:i')
                    ];
                });

            // Calculate earnings summary
            $totalEarnings = \App\Models\Transaction::where('type', 'event_registration')
                ->whereHas('event', function($query) use ($user) {
                    $query->where('created_by', $user->id);
                })
                ->where('status', 'paid')
                ->sum('net_amount');

            $monthlyEarnings = \App\Models\Transaction::where('type', 'event_registration')
                ->whereHas('event', function($query) use ($user) {
                    $query->where('created_by', $user->id);
                })
                ->where('status', 'paid')
                ->whereMonth('paid_at', now()->month)
                ->whereYear('paid_at', now()->year)
                ->sum('net_amount');

            $totalTransactions = \App\Models\Transaction::where('type', 'event_registration')
                ->whereHas('event', function($query) use ($user) {
                    $query->where('created_by', $user->id);
                })
                ->where('status', 'paid')
                ->count();

            return response()->json([
                'status' => 'success',
                'data' => [
                    'profile' => [
                        'current_balance' => $panitiaProfile->saldo ?? 0,
                        'total_earnings' => $totalEarnings,
                        'monthly_earnings' => $monthlyEarnings,
                        'total_transactions' => $totalTransactions,
                        'is_premium' => $panitiaProfile->isPremium(),
                        'premium_expires_at' => $panitiaProfile->premium_expires_at
                    ],
                    'recent_transactions' => $transactions
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil data earnings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all users untuk admin
     * Endpoint: GET /api/admin/all-users
     */
    public function getAllUsers(): JsonResponse
    {
        try {
            // Ambil semua users dengan relasi registrations dan panitiaProfile
            $users = \App\Models\User::with(['registrations', 'panitiaProfile'])
                ->select('id', 'name', 'email', 'role', 'status_akun', 'email_verified_at', 'created_at')
                ->get();

            // Map data dan tambahkan events_count
            $users = $users->map(function ($user) {
                $isPanitia = in_array($user->role, ['panitia', 'organizer']);

                // Untuk panitia, cek approval status dari panitia_profiles
                $panitiaStatus = 'approved';
                if ($isPanitia && $user->panitiaProfile) {
                    $panitiaStatus = $user->panitiaProfile->status ?? 'pending';
                }

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role ?? 'peserta',
                    // status_akun ENUM: 'aktif' atau 'belum_verifikasi'
                    'is_active' => $user->status_akun === 'aktif',
                    'status_akun' => $user->status_akun,
                    'email_verified_at' => $user->email_verified_at,
                    'created_at' => $user->created_at,
                    'events_count' => $user->registrations ? $user->registrations->count() : 0,
                    // Untuk panitia: cek panitia_profile status, User biasa: approved jika email verified
                    'status' => $isPanitia
                        ? $panitiaStatus
                        : ($user->email_verified_at ? 'approved' : 'pending'),
                    // Tambahan info untuk panitia
                    'panitia_info' => $isPanitia && $user->panitiaProfile ? [
                        'organization_name' => $user->panitiaProfile->organization_name,
                        'plan_type' => $user->panitiaProfile->plan_type,
                        'status' => $user->panitiaProfile->status
                    ] : null
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
    public function toggleStatus(Request $request, $id): JsonResponse
    {
        try {
            $user = \App\Models\User::findOrFail($id);

            // Toggle status - ENUM values: 'aktif' atau 'belum_verifikasi'
            if ($request->has('is_active')) {
                $newStatus = $request->is_active ? 'aktif' : 'belum_verifikasi';
            } else {
                $newStatus = $user->status_akun === 'aktif' ? 'belum_verifikasi' : 'aktif';
            }

            $user->status_akun = $newStatus;
            $user->save();

            return response()->json([
                'status' => 'success',
                'message' => 'User status updated successfully',
                'data' => [
                    'id' => $user->id,
                    'is_active' => $user->status_akun === 'aktif',
                    'status_akun' => $user->status_akun
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
    public function deleteUser($id): JsonResponse
    {
        try {
            $user = \App\Models\User::findOrFail($id);

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
    public function getUserEvents($id): JsonResponse
    {
        try {
            $user = \App\Models\User::with(['registrations.event'])->findOrFail($id);

            $events = $user->registrations->map(function ($registration) {
                // Debug: cek apakah event ada
                $event = $registration->event;

                if (!$event) {
                    \Log::warning("Registration {$registration->id} has no event");
                    return [
                        'id' => $registration->id,
                        'event_name' => 'Event Tidak Ditemukan',
                        'event_date' => null,
                        'status' => $registration->status ?? 'registered',
                        'registered_at' => $registration->created_at
                    ];
                }

                return [
                    'id' => $registration->id,
                    'event_name' => $event->judul ?? 'Unknown Event',
                    'event_date' => $event->tanggal_mulai ?? null,
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
     * Endpoint: POST /api/admin/organizers/{id}/approve or /api/admin/users/{id}/approve
     */
    public function approveOrganizer($id): JsonResponse
    {
        try {
            $user = \App\Models\User::with('panitiaProfile')->findOrFail($id);

            // Cek apakah user adalah panitia
            if (!in_array($user->role, ['panitia', 'organizer'])) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'User is not an organizer'
                ], 400);
            }

            DB::beginTransaction();

            // Update user
            $user->email_verified_at = \Carbon\Carbon::now();
            $user->status_akun = 'aktif'; // ✅ Sesuai ENUM database
            $user->save();

            // Update panitia profile jika ada
            if ($user->panitiaProfile) {
                $user->panitiaProfile->update([
                    'status' => 'approved',
                    'approved_at' => \Carbon\Carbon::now(),
                    'approved_by' => auth()->id()
                ]);
            }

            DB::commit();

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
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to approve organizer',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reject organizer/panitia
     * Endpoint: POST /api/admin/organizers/{id}/reject or /api/admin/users/{id}/reject
     */
    public function rejectOrganizer($id): JsonResponse
    {
        try {
            $user = \App\Models\User::with('panitiaProfile')->findOrFail($id);

            // Cek apakah user adalah panitia
            if (!in_array($user->role, ['panitia', 'organizer'])) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'User is not an organizer'
                ], 400);
            }

            DB::beginTransaction();

            // Update user
            $user->email_verified_at = null;
            $user->status_akun = 'belum_verifikasi'; // ✅ Sesuai ENUM database
            $user->save();

            // Update panitia profile jika ada
            if ($user->panitiaProfile) {
                $user->panitiaProfile->update([
                    'status' => 'rejected',
                    'approved_at' => null,
                    'approved_by' => null
                ]);
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Organizer rejected successfully',
                'data' => [
                    'id' => $user->id,
                    'status' => 'rejected'
                ]
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to reject organizer',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Suspend panitia - ubah role jadi user biasa dan suspend panitia profile
     * Endpoint: POST /api/admin/organizers/{id}/suspend or /api/admin/users/{id}/suspend
     */
    public function suspendOrganizer($id): JsonResponse
    {
        try {
            $user = \App\Models\User::with('panitiaProfile')->findOrFail($id);

            // Cek apakah user adalah panitia
            if (!in_array($user->role, ['panitia', 'organizer'])) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'User is not an organizer'
                ], 400);
            }

            DB::beginTransaction();

            // Update user - ubah role jadi peserta
            $user->role = 'peserta';
            $user->status_akun = 'aktif'; // ✅ Sesuai ENUM database
            $user->save();

            // Update panitia profile jika ada
            if ($user->panitiaProfile) {
                $user->panitiaProfile->update([
                    'status' => 'suspended',
                    'approved_at' => null
                ]);
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Organizer suspended successfully. Role changed to participant.',
                'data' => [
                    'id' => $user->id,
                    'role' => 'peserta',
                    'status' => 'suspended'
                ]
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to suspend organizer',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
