<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Setting;

class SessionTimeout
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Skip for API routes or if user not authenticated
        if ($request->is('api/*') || !auth()->check()) {
            return $next($request);
        }
        
        // Get session timeout from admin settings (in minutes)
        $timeoutMinutes = Setting::where('key', 'session_timeout')->value('value') ?? 120;
        
        $lastActivity = session('last_activity');
        $currentTime = time();
        
        if ($lastActivity && ($currentTime - $lastActivity) > ($timeoutMinutes * 60)) {
            // Session expired
            auth()->logout();
            session()->flush();
            
            if ($request->expectsJson()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Session expired. Please login again.',
                    'session_expired' => true
                ], 401);
            }
            
            return redirect('/signin')->with('message', 'Session expired. Please login again.');
        }
        
        // Update last activity
        session(['last_activity' => $currentTime]);
        
        return $next($request);
    }
}
