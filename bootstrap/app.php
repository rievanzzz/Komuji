<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Enable CORS for API
        $middleware->api(prepend: [
            \App\Http\Middleware\CorsMiddleware::class,
        ]);
        
        // Daftarkan alias middleware kita di sini
        $middleware->alias([
            'role' => \App\Http\Middleware\RoleMiddleware::class,
            'check.registration.time' => \App\Http\Middleware\CheckEventRegistrationTime::class,
            'check.creation.time' => \App\Http\Middleware\CheckEventCreationTime::class,
            'check.attendance.time' => \App\Http\Middleware\CheckAttendanceTime::class,
            'session.timeout' => \App\Http\Middleware\SessionTimeout::class,
            'panitia.status' => \App\Http\Middleware\CheckPanitiaStatus::class,
            'panitia.limits' => \App\Http\Middleware\CheckPanitiaLimits::class,
            'admin.only' => \App\Http\Middleware\AdminOnly::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })
    ->create();
