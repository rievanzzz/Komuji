<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();
        
        if (! $user) {
            return response()->json([
                'message' => 'Unauthenticated.'
            ], 401);
        }
        
        if (! in_array($user->role, $roles)) {
            return response()->json([
                'message' => 'Akses ditolak. Role yang diperlukan: ' . implode(', ', $roles) . '. Role Anda: ' . $user->role,
                'required_roles' => $roles,
                'your_role' => $user->role
            ], 403);
        }

        return $next($request);
    }
}
