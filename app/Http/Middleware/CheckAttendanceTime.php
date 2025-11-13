<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckAttendanceTime
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // For now, just pass through
        // This middleware can be used to check if attendance checking is allowed at certain times
        return $next($request);
    }
}
