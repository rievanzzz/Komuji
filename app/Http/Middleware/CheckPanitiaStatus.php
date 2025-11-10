<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPanitiaStatus
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth()->user();
        
        // Only check for panitia users
        if (!$user || !$user->isPanitia()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akses ditolak. Hanya panitia yang dapat mengakses fitur ini.'
            ], 403);
        }

        $profile = $user->panitiaProfile;
        
        // Check if panitia profile exists
        if (!$profile) {
            return response()->json([
                'status' => 'error',
                'message' => 'Profil panitia tidak ditemukan. Silakan hubungi administrator.'
            ], 403);
        }

        // Check if panitia is approved
        if ($profile->status !== 'approved') {
            $messages = [
                'pending' => 'Akun panitia Anda masih menunggu persetujuan admin.',
                'rejected' => 'Akun panitia Anda ditolak. Alasan: ' . ($profile->rejection_reason ?: 'Tidak disebutkan'),
                'suspended' => 'Akun panitia Anda disuspend. Alasan: ' . ($profile->rejection_reason ?: 'Tidak disebutkan')
            ];
            
            return response()->json([
                'status' => 'error',
                'message' => $messages[$profile->status] ?? 'Status akun panitia tidak valid.',
                'panitia_status' => $profile->status
            ], 403);
        }

        // Add panitia profile to request for easy access
        $request->attributes->set('panitia_profile', $profile);
        
        return $next($request);
    }
}
