<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Event;
use App\Models\PanitiaProfile;
use App\Models\Setting;

class CheckPanitiaLimits
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth()->user();
        
        if (!$user || !$user->isPanitia()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akses ditolak.'
            ], 403);
        }

        $profile = $user->panitiaProfile;
        
        if (!$profile || $profile->status !== 'approved') {
            return response()->json([
                'status' => 'error',
                'message' => 'Akun panitia belum disetujui.'
            ], 403);
        }

        // Check if creating new event
        if ($request->isMethod('POST') && $request->is('api/events')) {
            // Count active events
            $activeEventsCount = Event::where('created_by', $user->id)
                ->where('is_published', true)
                ->where('tanggal_selesai', '>=', now())
                ->count();

            // Get max events from settings (dynamic from admin settings)
            $maxEvents = $profile->max_active_events;
            
            // Override with admin settings if available
            if ($profile->plan_type === 'free') {
                $maxEvents = Setting::where('key', 'free_max_active_events')->value('value') ?? $maxEvents;
            } elseif ($profile->plan_type === 'premium') {
                $maxEvents = Setting::where('key', 'premium_max_active_events')->value('value') ?? $maxEvents;
            }
            
            // Check limit
            if ($activeEventsCount >= $maxEvents) {
                $planName = $profile->plan_type === 'free' ? 'Gratis' : ucfirst($profile->plan_type);
                
                return response()->json([
                    'status' => 'error',
                    'message' => "Batas maksimal event aktif untuk paket {$planName} adalah {$maxEvents}. Upgrade ke Premium untuk event unlimited.",
                    'current_active_events' => $activeEventsCount,
                    'max_active_events' => $maxEvents,
                    'plan_type' => $profile->plan_type,
                    'upgrade_required' => $profile->plan_type !== 'premium'
                ], 403);
            }
        }

        // Check trial expiry
        if ($profile->plan_type === 'trial' && $profile->is_trial_expired) {
            // Auto downgrade to free
            $profile->downgradeToFree();
            
            return response()->json([
                'status' => 'warning',
                'message' => 'Trial Anda telah berakhir. Akun telah diubah ke paket Gratis dengan fitur terbatas.',
                'plan_type' => 'free',
                'trial_expired' => true,
                'upgrade_available' => true
            ], 200);
        }

        // Check premium expiry
        if ($profile->plan_type === 'premium' && $profile->is_premium_expired) {
            // Auto downgrade to free
            $profile->downgradeToFree();
            
            return response()->json([
                'status' => 'warning',
                'message' => 'Langganan Premium Anda telah berakhir. Akun telah diubah ke paket Gratis.',
                'plan_type' => 'free',
                'premium_expired' => true,
                'renewal_required' => true
            ], 200);
        }

        // Add plan info to request
        $request->attributes->set('panitia_plan', [
            'type' => $profile->plan_type,
            'max_events' => $profile->max_active_events,
            'trial_days_left' => $profile->trial_days_left,
            'premium_days_left' => $profile->premium_days_left
        ]);
        
        return $next($request);
    }
}
