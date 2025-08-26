<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\RegistrationController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Include authentication routes
require __DIR__.'/auth.php';

// Public routes
Route::get('/test', function () {
    return response()->json(['message' => 'API is working!']);
});

// Authentication routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/login', [AuthController::class, 'login']);

// Public event routes
Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{event}', [EventController::class, 'show']);

// Protected routes
Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    // User routes
    Route::get('/user', function (Request $request) {
        return response()->json($request->user());
    });

    // Logout
    Route::post('/logout', [AuthController::class, 'logout']);

    // Admin Aplikasi routes
    Route::middleware('role:admin_aplikasi')->group(function () {
        Route::get('/admin-aplikasi/dashboard', function () {
            return response()->json([
                'message' => 'Halo Admin Aplikasi, kamu punya semua akses.'
            ]);
        });
    });

    // Peserta routes
    Route::middleware('role:peserta')->group(function () {
        Route::get('/my-registrations', [RegistrationController::class, 'myRegistrations']);
        Route::post('/events/{event}/register', [RegistrationController::class, 'register']);
        Route::post('/validate-attendance', [RegistrationController::class, 'validateAttendance']);
    });

    // Admin Acara routes
    Route::middleware('role:admin_acara')->group(function () {
        // Event management
        Route::post('/events', [EventController::class, 'store']);
        Route::put('/events/{event}', [EventController::class, 'update']);
        Route::delete('/events/{event}', [EventController::class, 'destroy']);
        
        // Registration management
        Route::get('/events/{event}/registrations', [RegistrationController::class, 'eventRegistrations']);
        Route::put('/registrations/{registration}/approve', [RegistrationController::class, 'approve']);
        Route::put('/registrations/{registration}/reject', [RegistrationController::class, 'reject']);
    });

    // Dashboard route
    Route::get('/dashboard', function () {
        $user = auth()->user();
        $data = [
            'user' => $user,
            'message' => 'Selamat datang di dashboard ' . $user->role
        ];

        if ($user->hasRole('admin_acara')) {
            $data['stats'] = [
                'total_events' => \App\Models\Event::count(),
                'total_participants' => \App\Models\Registration::count(),
                'upcoming_events' => \App\Models\Event::where('tanggal_mulai', '>=', now())->count(),
            ];
        } elseif ($user->hasRole('peserta')) {
            $data['stats'] = [
                'registered_events' => $user->registrations()->count(),
                'attended_events' => $user->attendances()->where('is_verified', true)->count(),
                'certificates' => $user->certificates()->count(),
            ];
        }

        return response()->json($data);
    });
});
