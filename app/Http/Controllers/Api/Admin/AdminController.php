<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Event;
use App\Models\PanitiaProfile;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdminController extends Controller
{
    /**
     * Get all panitias for management
     */
    public function getPanitias(Request $request): JsonResponse
    {
        try {
            $query = User::with(['panitiaProfile'])
                ->where('role', 'panitia')
                ->whereHas('panitiaProfile');

            // Filter by status if provided
            if ($request->has('status') && $request->status !== 'all') {
                $query->whereHas('panitiaProfile', function($q) use ($request) {
                    $q->where('status', $request->status);
                });
            }

            $panitias = $query->get()->map(function($user) {
                $profile = $user->panitiaProfile;
                
                // Calculate total events and revenue (mock for now)
                $totalEvents = Event::where('created_by', $user->id)->count();
                $totalRevenue = Event::where('created_by', $user->id)
                    ->sum('harga_tiket') * 0.95; // 95% goes to organizer

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->no_handphone,
                    'organization' => $profile->nama_organisasi ?? 'N/A',
                    'status' => $profile->status,
                    'plan_type' => $profile->plan_type,
                    'created_at' => $user->created_at->toISOString(),
                    'approved_at' => $profile->approved_at?->toISOString(),
                    'trial_end' => $profile->trial_end?->toISOString(),
                    'premium_end' => $profile->premium_end?->toISOString(),
                    'total_events' => $totalEvents,
                    'total_revenue' => $totalRevenue
                ];
            });

            return response()->json([
                'status' => 'success',
                'data' => $panitias
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil data panitia',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get transactions for admin
     */
    public function getTransactions(Request $request): JsonResponse
    {
        try {
            $days = $request->get('days', 30);
            $dateFrom = Carbon::now()->subDays($days);

            // Mock transaction data for now
            // In real implementation, this would come from a transactions table
            $mockTransactions = [
                [
                    'id' => 'TXN001',
                    'event_id' => 'evt_001',
                    'event_title' => 'Tech Conference 2024',
                    'organizer_name' => 'John Organizer',
                    'participant_name' => 'Alice Johnson',
                    'amount' => 500000,
                    'commission' => 25000,
                    'net_amount' => 475000,
                    'status' => 'completed',
                    'payment_method' => 'Credit Card',
                    'created_at' => Carbon::now()->subDays(2)->toISOString()
                ],
                [
                    'id' => 'TXN002',
                    'event_id' => 'evt_002',
                    'event_title' => 'Workshop Design Thinking',
                    'organizer_name' => 'Jane Smith',
                    'participant_name' => 'Bob Wilson',
                    'amount' => 250000,
                    'commission' => 12500,
                    'net_amount' => 237500,
                    'status' => 'completed',
                    'payment_method' => 'Bank Transfer',
                    'created_at' => Carbon::now()->subDays(5)->toISOString()
                ]
            ];

            return response()->json([
                'status' => 'success',
                'data' => $mockTransactions
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil data transaksi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get revenue statistics
     */
    public function getRevenueStats(Request $request): JsonResponse
    {
        try {
            $days = $request->get('days', 30);
            
            // Mock revenue stats for now
            $stats = [
                'total_revenue' => 15750000,
                'total_commission' => 787500,
                'monthly_revenue' => 5250000,
                'monthly_commission' => 262500,
                'growth_percentage' => 12.5
            ];

            return response()->json($stats);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil statistik revenue',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get report data
     */
    public function getReports(Request $request): JsonResponse
    {
        try {
            $type = $request->get('type', 'overview');
            $months = $request->get('months', 12);

            $totalEvents = Event::count();
            $totalUsers = User::count();
            $totalOrganizers = User::where('role', 'panitia')->count();
            
            // Mock data for comprehensive reports
            $reportData = [
                'total_events' => $totalEvents,
                'total_users' => $totalUsers,
                'total_organizers' => $totalOrganizers,
                'total_revenue' => 45750000,
                'monthly_growth' => 18.5,
                'event_categories' => [
                    ['name' => 'Technology', 'count' => 45, 'percentage' => 28.8],
                    ['name' => 'Business', 'count' => 32, 'percentage' => 20.5],
                    ['name' => 'Education', 'count' => 28, 'percentage' => 17.9],
                    ['name' => 'Entertainment', 'count' => 25, 'percentage' => 16.0],
                    ['name' => 'Health', 'count' => 15, 'percentage' => 9.6],
                    ['name' => 'Others', 'count' => 11, 'percentage' => 7.1]
                ],
                'monthly_data' => [
                    ['month' => 'Jan', 'events' => 12, 'revenue' => 3200000, 'users' => 145],
                    ['month' => 'Feb', 'events' => 15, 'revenue' => 4100000, 'users' => 189],
                    ['month' => 'Mar', 'events' => 18, 'revenue' => 4800000, 'users' => 234],
                    ['month' => 'Apr', 'events' => 14, 'revenue' => 3900000, 'users' => 198],
                    ['month' => 'May', 'events' => 22, 'revenue' => 5600000, 'users' => 287],
                    ['month' => 'Jun', 'events' => 19, 'revenue' => 5100000, 'users' => 256]
                ],
                'top_organizers' => [
                    ['name' => 'Tech Events Indonesia', 'events' => 12, 'revenue' => 8500000],
                    ['name' => 'Business Summit Org', 'events' => 8, 'revenue' => 6200000],
                    ['name' => 'Education Hub', 'events' => 10, 'revenue' => 4800000]
                ],
                'recent_activities' => [
                    [
                        'type' => 'event_created',
                        'description' => 'New event "AI Workshop 2024" created',
                        'date' => Carbon::now()->subHours(2)->toISOString()
                    ],
                    [
                        'type' => 'organizer_approved',
                        'description' => 'New organizer approved',
                        'date' => Carbon::now()->subHours(5)->toISOString()
                    ]
                ]
            ];

            return response()->json($reportData);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil data laporan',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get system settings
     */
    public function getSettings(): JsonResponse
    {
        try {
            // Get all settings from database
            $settings = Setting::pluck('value', 'key')->toArray();
            
            // Default settings if not found in database
            $defaultSettings = [
                'commission_rate' => 5,
                'min_commission' => 1000,
                'max_commission' => 1000000,
                'trial_duration_days' => 60,
                'free_max_active_events' => 1,
                'premium_max_active_events' => 999,
                'auto_approve_panitia' => false,
                'auto_approve_events' => false,
                'platform_name' => 'Komuji',
                'platform_description' => 'Platform Event Management Terpercaya',
                'support_email' => 'support@komuji.com',
                'support_phone' => '+62-21-1234-5678'
            ];

            $finalSettings = array_merge($defaultSettings, $settings);

            return response()->json([
                'status' => 'success',
                'settings' => $finalSettings
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil pengaturan sistem',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update system settings
     */
    public function updateSettings(Request $request): JsonResponse
    {
        try {
            DB::beginTransaction();

            foreach ($request->all() as $key => $value) {
                Setting::updateOrCreate(
                    ['key' => $key],
                    ['value' => $value]
                );
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Pengaturan berhasil disimpan'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menyimpan pengaturan',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
