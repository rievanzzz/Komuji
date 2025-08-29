<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\RegistrationController;
use App\Http\Controllers\Api\UserController;

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

// Password reset routes
Route::post('/forgot-password', [\App\Http\Controllers\Auth\ForgotPasswordController::class, 'sendResetLink']);
Route::post('/reset-password', [\App\Http\Controllers\Auth\ResetPasswordController::class, 'reset']);

// Add this route for the password reset link
Route::get('/reset-password/{token}', function ($token) {
    return response()->json([
        'status' => 'success',
        'message' => 'Silakan gunakan token ini untuk mereset password',
        'token' => $token
    ]);
})->name('password.reset');

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
    Route::get('/user', [UserController::class, 'profile']);
    Route::put('/user/profile', [UserController::class, 'updateProfile']);
    Route::post('/user/change-password', [UserController::class, 'changePassword']);

    // Logout
    Route::post('/logout', [AuthController::class, 'logout']);

    // Admin routes
    Route::middleware('role:admin')->group(function () {
        Route::get('/admin/dashboard', function () {
            return response()->json([
                'message' => 'Halo Admin, kamu punya semua akses.'
            ]);
        });
    });

    // Peserta routes
    Route::middleware('role:peserta')->group(function () {
        // Event registration
        Route::get('/my-registrations', [RegistrationController::class, 'myRegistrations']);
        Route::post('/events/{event}/register', [RegistrationController::class, 'register']);
        
        // Registration management
        Route::delete('/registrations/{registration}/cancel', [RegistrationController::class, 'cancelRegistration']);
        
        // Attendance
        Route::post('/validate-attendance', [RegistrationController::class, 'validateAttendance']);
        
        // Certificates
        Route::get('/registrations/{registration}/certificate', [RegistrationController::class, 'generateCertificate']);
    });

    // Panitia routes
    Route::middleware('role:panitia')->group(function () {
        // Event management
        Route::post('/events', [EventController::class, 'store']);
        Route::put('/events/{event}', [EventController::class, 'update']);
        Route::delete('/events/{event}', [EventController::class, 'destroy']);
        
        // Event registrations management
        Route::get('/events/{event}/registrations', [EventController::class, 'registrations']);
        Route::get('/events/{event}/export-attendance', [EventController::class, 'exportAttendance'])
            ->name('events.export-attendance');
            
        // Registration approval
        Route::put('/registrations/{registration}/approve', [RegistrationController::class, 'approve'])
            ->name('registrations.approve');
        Route::put('/registrations/{registration}/reject', [RegistrationController::class, 'reject'])
            ->name('registrations.reject');
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
