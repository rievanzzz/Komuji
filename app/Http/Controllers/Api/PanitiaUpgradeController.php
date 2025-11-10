<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\PanitiaProfile;
use App\Models\Setting;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PanitiaUpgradeController extends Controller
{
    /**
     * Check if user can upgrade to panitia
     */
    public function checkEligibility(): JsonResponse
    {
        try {
            $user = auth()->user();
            
            // Check if user is peserta
            if ($user->role !== 'peserta') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Hanya peserta yang dapat upgrade ke panitia',
                    'eligible' => false
                ], 400);
            }

            // Check if already has panitia profile
            $existingProfile = PanitiaProfile::where('user_id', $user->id)->first();
            if ($existingProfile) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Anda sudah memiliki profil panitia',
                    'eligible' => false,
                    'current_status' => $existingProfile->status
                ], 400);
            }

            // Get upgrade info
            $upgradeInfo = [
                'auto_approve' => Setting::get('auto_approve_panitia', false),
                'trial_duration' => Setting::get('trial_duration_days', 60),
                'premium_price' => Setting::get('premium_monthly_price', 100000),
                'benefits' => [
                    'trial' => [
                        'duration' => Setting::get('trial_duration_days', 60) . ' hari gratis',
                        'max_events' => 'Event unlimited',
                        'analytics' => 'Analytics lengkap',
                        'support' => 'Priority support'
                    ],
                    'after_trial' => [
                        'free_plan' => 'Maksimal ' . Setting::get('free_max_active_events', 1) . ' event aktif',
                        'premium_plan' => 'Rp' . number_format(Setting::get('premium_monthly_price', 100000)) . '/bulan untuk unlimited'
                    ]
                ]
            ];

            return response()->json([
                'status' => 'success',
                'eligible' => true,
                'upgrade_info' => $upgradeInfo
            ]);
        } catch (\Exception $e) {
            Log::error('Check upgrade eligibility error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengecek kelayakan upgrade'
            ], 500);
        }
    }

    /**
     * Upgrade user to panitia
     */
    public function upgrade(Request $request): JsonResponse
    {
        $request->validate([
            'organization_name' => 'required|string|max:255',
            'organization_description' => 'required|string|max:1000',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'website' => 'nullable|url|max:255'
        ]);

        try {
            $user = auth()->user();
            
            // Double check eligibility
            if ($user->role !== 'peserta') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Hanya peserta yang dapat upgrade ke panitia'
                ], 400);
            }

            $existingProfile = PanitiaProfile::where('user_id', $user->id)->first();
            if ($existingProfile) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Anda sudah memiliki profil panitia'
                ], 400);
            }

            DB::beginTransaction();

            // Update user role
            $user->update(['role' => 'panitia']);

            // Create panitia profile
            $autoApprove = Setting::get('auto_approve_panitia', false);
            $trialDays = Setting::get('trial_duration_days', 60);
            $maxEvents = Setting::get('premium_max_active_events', 999);

            $panitiaProfile = PanitiaProfile::create([
                'user_id' => $user->id,
                'status' => $autoApprove ? 'approved' : 'pending',
                'plan_type' => 'trial',
                'trial_start' => $autoApprove ? now() : null,
                'trial_end' => $autoApprove ? now()->addDays($trialDays) : null,
                'max_active_events' => $autoApprove ? $maxEvents : 1,
                'organization_name' => $request->organization_name,
                'organization_description' => $request->organization_description,
                'phone' => $request->phone ?: $user->no_handphone,
                'address' => $request->address ?: $user->alamat,
                'website' => $request->website
            ]);

            // If auto approved, start trial immediately
            if ($autoApprove) {
                $panitiaProfile->update([
                    'approved_at' => now(),
                    'approved_by' => null // System approved
                ]);
                
                // Send approval notification
                Notification::notifyPanitiaApproved($user->id);
            } else {
                // Send notification about pending review
                Notification::createForUser(
                    $user->id,
                    'Upgrade ke Panitia Diajukan',
                    'Permintaan upgrade ke panitia Anda sedang direview oleh admin. Kami akan memberitahu Anda setelah proses review selesai.',
                    'general'
                );
            }

            DB::commit();

            Log::info('User upgraded to panitia', [
                'user_id' => $user->id,
                'auto_approved' => $autoApprove
            ]);

            $message = $autoApprove 
                ? 'Selamat! Anda berhasil upgrade ke panitia dan langsung disetujui. Sekarang Anda bisa membuat event.'
                : 'Permintaan upgrade ke panitia berhasil diajukan. Silakan tunggu persetujuan dari admin.';

            return response()->json([
                'status' => 'success',
                'message' => $message,
                'panitia_status' => $autoApprove ? 'approved' : 'pending',
                'trial_info' => $autoApprove ? [
                    'trial_days_left' => $trialDays,
                    'trial_end' => now()->addDays($trialDays)->format('Y-m-d')
                ] : null
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Upgrade to panitia error: ' . $e->getMessage());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal melakukan upgrade ke panitia. Silakan coba lagi.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Get upgrade status for current user
     */
    public function getStatus(): JsonResponse
    {
        try {
            $user = auth()->user();
            
            if ($user->role === 'peserta') {
                $profile = PanitiaProfile::where('user_id', $user->id)->first();
                
                if (!$profile) {
                    return response()->json([
                        'status' => 'success',
                        'upgrade_status' => 'not_requested',
                        'can_upgrade' => true
                    ]);
                }

                return response()->json([
                    'status' => 'success',
                    'upgrade_status' => 'requested',
                    'panitia_status' => $profile->status,
                    'can_upgrade' => false,
                    'profile' => [
                        'status' => $profile->status,
                        'status_badge' => $profile->status_badge,
                        'organization_name' => $profile->organization_name,
                        'approved_at' => $profile->approved_at,
                        'rejection_reason' => $profile->rejection_reason
                    ]
                ]);
            }

            if ($user->role === 'panitia') {
                $profile = $user->panitiaProfile;
                
                return response()->json([
                    'status' => 'success',
                    'upgrade_status' => 'completed',
                    'panitia_status' => $profile ? $profile->status : 'unknown',
                    'can_upgrade' => false,
                    'profile' => $profile ? [
                        'status' => $profile->status,
                        'status_badge' => $profile->status_badge,
                        'plan_type' => $profile->plan_type,
                        'plan_badge' => $profile->plan_badge,
                        'organization_name' => $profile->organization_name,
                        'trial_days_left' => $profile->trial_days_left,
                        'premium_days_left' => $profile->premium_days_left
                    ] : null
                ]);
            }

            return response()->json([
                'status' => 'success',
                'upgrade_status' => 'not_applicable',
                'can_upgrade' => false,
                'message' => 'Admin tidak perlu upgrade'
            ]);

        } catch (\Exception $e) {
            Log::error('Get upgrade status error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil status upgrade'
            ], 500);
        }
    }
}
