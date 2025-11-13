<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\PanitiaProfile;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PanitiaController extends Controller
{
    /**
     * Get all panitia with their profiles and stats
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = User::with(['panitiaProfile', 'events'])
                ->where('role', 'panitia');

            // Filter by status
            if ($request->has('status')) {
                $query->whereHas('panitiaProfile', function ($q) use ($request) {
                    $q->where('status', $request->status);
                });
            }

            // Filter by plan type
            if ($request->has('plan_type')) {
                $query->whereHas('panitiaProfile', function ($q) use ($request) {
                    $q->where('plan_type', $request->plan_type);
                });
            }

            // Search by name or email
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            $panitias = $query->paginate(15);

            // Transform data
            $panitias->getCollection()->transform(function ($panitia) {
                $profile = $panitia->panitiaProfile;
                $eventsCount = $panitia->events->count();
                $activeEventsCount = $panitia->events->where('is_published', true)
                    ->where('tanggal_selesai', '>=', now())->count();

                return [
                    'id' => $panitia->id,
                    'name' => $panitia->name,
                    'email' => $panitia->email,
                    'created_at' => $panitia->created_at,
                    'profile' => $profile ? [
                        'id' => $profile->id,
                        'status' => $profile->status,
                        'status_badge' => $profile->status_badge,
                        'plan_type' => $profile->plan_type,
                        'plan_badge' => $profile->plan_badge,
                        'trial_end' => $profile->trial_end,
                        'premium_end' => $profile->premium_end,
                        'trial_days_left' => $profile->trial_days_left,
                        'premium_days_left' => $profile->premium_days_left,
                        'saldo' => $profile->saldo,
                        'total_earnings' => $profile->total_earnings,
                        'total_fees_paid' => $profile->total_fees_paid,
                        'organization_name' => $profile->organization_name,
                        'phone' => $profile->phone,
                        'approved_at' => $profile->approved_at,
                        'rejection_reason' => $profile->rejection_reason
                    ] : null,
                    'stats' => [
                        'total_events' => $eventsCount,
                        'active_events' => $activeEventsCount,
                        'total_participants' => $profile ? $profile->total_participants : 0
                    ]
                ];
            });

            return response()->json([
                'status' => 'success',
                'data' => $panitias
            ]);
        } catch (\Exception $e) {
            Log::error('Admin get panitias error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil data panitia'
            ], 500);
        }
    }

    /**
     * Get pending panitia registrations
     */
    public function pending(): JsonResponse
    {
        try {
            $pendingPanitias = User::with('panitiaProfile')
                ->where('role', 'panitia')
                ->whereHas('panitiaProfile', function ($q) {
                    $q->where('status', 'pending');
                })
                ->orderBy('created_at', 'desc')
                ->get();

            $pendingPanitias->transform(function ($panitia) {
                $profile = $panitia->panitiaProfile;
                return [
                    'id' => $panitia->id,
                    'name' => $panitia->name,
                    'email' => $panitia->email,
                    'created_at' => $panitia->created_at,
                    'organization_name' => $profile->organization_name,
                    'organization_description' => $profile->organization_description,
                    'phone' => $profile->phone,
                    'address' => $profile->address,
                    'website' => $profile->website,
                    'days_waiting' => $panitia->created_at->diffInDays(now())
                ];
            });

            return response()->json([
                'status' => 'success',
                'data' => $pendingPanitias
            ]);
        } catch (\Exception $e) {
            Log::error('Admin get pending panitias error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil data panitia pending'
            ], 500);
        }
    }

    /**
     * Approve panitia registration
     */
    public function approve(Request $request, $id): JsonResponse
    {
        $request->validate([
            'plan_type' => 'required|in:trial,premium',
            'premium_duration' => 'required_if:plan_type,premium|integer|min:1|max:12'
        ]);

        try {
            $panitia = User::with('panitiaProfile')->findOrFail($id);
            
            if (!$panitia->panitiaProfile) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Profil panitia tidak ditemukan'
                ], 404);
            }

            if ($panitia->panitiaProfile->status !== 'pending') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Panitia sudah diproses sebelumnya'
                ], 400);
            }

            DB::beginTransaction();

            // Approve panitia with plan type
            $panitia->panitiaProfile->approve(auth()->id(), $request->plan_type, $request->premium_duration);

            // Send notification
            Notification::notifyPanitiaApproved($panitia->id);

            DB::commit();

            Log::info('Panitia approved', [
                'panitia_id' => $panitia->id,
                'approved_by' => auth()->id(),
                'plan_type' => $request->plan_type,
                'premium_duration' => $request->premium_duration
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Panitia berhasil disetujui'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Admin approve panitia error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menyetujui panitia'
            ], 500);
        }
    }

    /**
     * Reject panitia registration
     */
    public function reject(Request $request, $id): JsonResponse
    {
        $request->validate([
            'reason' => 'required|string|max:500'
        ]);

        try {
            $panitia = User::with('panitiaProfile')->findOrFail($id);
            
            if (!$panitia->panitiaProfile) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Profil panitia tidak ditemukan'
                ], 404);
            }

            if ($panitia->panitiaProfile->status !== 'pending') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Panitia sudah diproses sebelumnya'
                ], 400);
            }

            DB::beginTransaction();

            // Reject panitia
            $panitia->panitiaProfile->reject($request->reason);

            // Send notification
            Notification::notifyPanitiaRejected($panitia->id, $request->reason);

            DB::commit();

            Log::info('Panitia rejected', [
                'panitia_id' => $panitia->id,
                'reason' => $request->reason,
                'rejected_by' => auth()->id()
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Panitia berhasil ditolak'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Admin reject panitia error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menolak panitia'
            ], 500);
        }
    }

    /**
     * Suspend panitia
     */
    public function suspend(Request $request, $id): JsonResponse
    {
        $request->validate([
            'reason' => 'required|string|max:500'
        ]);

        try {
            $panitia = User::with('panitiaProfile')->findOrFail($id);
            
            if (!$panitia->panitiaProfile) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Profil panitia tidak ditemukan'
                ], 404);
            }

            $panitia->panitiaProfile->update([
                'status' => 'suspended',
                'rejection_reason' => $request->reason
            ]);

            // Send notification
            Notification::createForUser(
                $panitia->id,
                'Akun Disuspend',
                'Akun panitia Anda telah disuspend. Alasan: ' . $request->reason,
                'general'
            );

            Log::info('Panitia suspended', [
                'panitia_id' => $panitia->id,
                'reason' => $request->reason,
                'suspended_by' => auth()->id()
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Panitia berhasil disuspend'
            ]);
        } catch (\Exception $e) {
            Log::error('Admin suspend panitia error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mensuspend panitia'
            ], 500);
        }
    }

    /**
     * Get panitia statistics
     */
    public function stats(): JsonResponse
    {
        try {
            $stats = [
                'total_panitias' => User::where('role', 'panitia')->count(),
                'pending_approvals' => PanitiaProfile::where('status', 'pending')->count(),
                'approved_panitias' => PanitiaProfile::where('status', 'approved')->count(),
                'rejected_panitias' => PanitiaProfile::where('status', 'rejected')->count(),
                'suspended_panitias' => PanitiaProfile::where('status', 'suspended')->count(),
                'trial_panitias' => PanitiaProfile::where('plan_type', 'trial')->count(),
                'free_panitias' => PanitiaProfile::where('plan_type', 'free')->count(),
                'premium_panitias' => PanitiaProfile::where('plan_type', 'premium')->count(),
                'total_earnings' => PanitiaProfile::sum('total_earnings'),
                'total_fees_collected' => PanitiaProfile::sum('total_fees_paid'),
                'total_saldo' => PanitiaProfile::sum('saldo')
            ];

            // Monthly registration stats
            $monthlyStats = User::where('role', 'panitia')
                ->selectRaw('MONTH(created_at) as month, COUNT(*) as count')
                ->whereYear('created_at', date('Y'))
                ->groupBy('month')
                ->orderBy('month')
                ->get()
                ->mapWithKeys(function ($item) {
                    $monthNames = [
                        1 => 'Jan', 2 => 'Feb', 3 => 'Mar', 4 => 'Apr',
                        5 => 'Mei', 6 => 'Jun', 7 => 'Jul', 8 => 'Aug',
                        9 => 'Sep', 10 => 'Oct', 11 => 'Nov', 12 => 'Dec'
                    ];
                    return [$monthNames[$item->month] => $item->count];
                });

            $stats['monthly_registrations'] = $monthlyStats;

            return response()->json([
                'status' => 'success',
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            Log::error('Admin panitia stats error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil statistik panitia'
            ], 500);
        }
    }
}
