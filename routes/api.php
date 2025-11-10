<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\Admin\PanitiaController as AdminPanitiaController;
use App\Http\Controllers\Api\Admin\TransactionController as AdminTransactionController;
use App\Http\Controllers\Api\Admin\SettingController as AdminSettingController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\RegistrationController;
use App\Http\Controllers\Api\TicketCategoryController;
use App\Http\Controllers\Api\PanitiaUpgradeController;

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
Route::post('/register-panitia', [AuthController::class, 'registerPanitia']);
Route::get('/registration-options', [AuthController::class, 'getRegistrationOptions']);
Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/resend-otp', [AuthController::class, 'resendOtp']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [\App\Http\Controllers\Auth\ForgotPasswordController::class, 'sendResetLink']);
Route::get('/reset-password/{token}', function ($token) {
    return response()->json([
        'status' => 'success',
        'message' => 'Silakan gunakan token ini untuk mereset password',
        'token' => $token
    ]);
})->name('password.reset');
Route::post('/reset-password', [\App\Http\Controllers\Auth\ResetPasswordController::class, 'reset']);

// Public event routes
Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{event}', [EventController::class, 'show']);
Route::get('/events/{event}/ticket-categories', [TicketCategoryController::class, 'index']);

// Protected routes
Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    // User routes
    Route::get('/user', [UserController::class, 'profile']);
    Route::get('/profile', [UserController::class, 'profile']); 
    Route::get('/me', [UserController::class, 'profile']); 
    Route::get('/user/profile', [UserController::class, 'profile']); 
    Route::put('/user/profile', [UserController::class, 'updateProfile']);
    Route::put('/profile', [UserController::class, 'updateProfile']); 
    Route::post('/user/change-password', [UserController::class, 'changePassword']);

    // Panitia upgrade routes
    Route::get('/upgrade/check-eligibility', [PanitiaUpgradeController::class, 'checkEligibility']);
    Route::get('/upgrade/status', [PanitiaUpgradeController::class, 'getStatus']);
    Route::post('/upgrade/to-panitia', [PanitiaUpgradeController::class, 'upgrade']); 

    // Logout
    Route::post('/logout', [AuthController::class, 'logout']);

    // Test route for debugging update
    Route::get('/test-update/{event}', function (\App\Models\Event $event) {
        // Simulate an update request
        $request = new \Illuminate\Http\Request([
            'judul' => 'Updated Test Event ' . now()->format('H:i:s'),
            'deskripsi' => 'This is an updated test event',
            'tanggal_mulai' => '2025-01-01',
            'tanggal_selesai' => '2025-01-02',
            'waktu_mulai' => '09:00:00',
            'waktu_selesai' => '17:00:00',
            'lokasi' => 'Test Location Updated',
            'kuota' => 100,
            'is_published' => true
        ]);

        $controller = new \App\Http\Controllers\Api\EventController();
        return $controller->update(
            new \App\Http\Requests\Event\UpdateEventRequest($request->all()),
            $event
        );
    });

    // Admin routes
    Route::middleware('role:admin')->group(function () {
        Route::get('/admin/dashboard', function () {
            return response()->json([
                'message' => 'Halo Admin, kamu punya semua akses.'
            ]);
        });
    });

    // Event registration - available for all authenticated users
    Route::post('/events/{event}/register', [RegistrationController::class, 'register']);
    Route::get('/my-registrations', [RegistrationController::class, 'myRegistrations']);
    
    // Email service endpoints
    Route::post('/send-eticket', [RegistrationController::class, 'sendETicket']);
    Route::post('/send-confirmation', [RegistrationController::class, 'sendConfirmation']);
    Route::post('/send-reminder', [RegistrationController::class, 'sendReminder']);
    Route::post('/send-invoice', [RegistrationController::class, 'sendInvoice']);

    // Peserta routes
    Route::middleware('role:peserta')->group(function () {

        // Registration management
        Route::delete('/registrations/{registration}/cancel', [RegistrationController::class, 'cancelRegistration']);

        // Attendance
        Route::post('/validate-attendance', [RegistrationController::class, 'validateAttendance']);

        // Certificates
        Route::get('/registrations/{registration}/certificate', [RegistrationController::class, 'generateCertificate']);
    });

    // Panitia routes - with business logic checks
    Route::middleware(['role:panitia,admin', 'panitia.status', 'panitia.limits'])->group(function () {
        // Event management
        Route::post('/events', [EventController::class, 'store'])
            ->middleware('check.creation.time');
        Route::put('/events/{event}', [EventController::class, 'update'])
            ->middleware('check.creation.time');
        Route::delete('/events/{event}', [EventController::class, 'destroy']);

        // Ticket category management
        Route::post('/events/{event}/ticket-categories', [TicketCategoryController::class, 'store']);
        Route::put('/events/{event}/ticket-categories/{ticketCategory}', [TicketCategoryController::class, 'update']);
        Route::delete('/events/{event}/ticket-categories/{ticketCategory}', [TicketCategoryController::class, 'destroy']);

        // Event registrations management
        Route::get('/events/{event}/registrations', [EventController::class, 'registrations']);
        Route::get('/events/{event}/export-attendance', [EventController::class, 'exportAttendance'])
            ->name('events.export-attendance');

        // Registration approval
        Route::put('/registrations/{registration}/approve', [RegistrationController::class, 'approve'])
            ->name('registrations.approve');
        Route::put('/registrations/{registration}/reject', [RegistrationController::class, 'reject'])
            ->name('registrations.reject');
            
        // Get pending registrations for events created by the authenticated user
        Route::get('/my-events/pending-registrations', [RegistrationController::class, 'pendingRegistrations'])
            ->name('registrations.pending');
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

    // Admin routes
    Route::middleware('admin.only')->prefix('admin')->group(function () {
        // Panitia management
        Route::get('/panitias', [AdminPanitiaController::class, 'index']);
        Route::get('/panitias/pending', [AdminPanitiaController::class, 'pending']);
        Route::get('/panitias/stats', [AdminPanitiaController::class, 'stats']);
        Route::post('/panitias/{id}/approve', [AdminPanitiaController::class, 'approve']);
        Route::post('/panitias/{id}/reject', [AdminPanitiaController::class, 'reject']);
        Route::post('/panitias/{id}/suspend', [AdminPanitiaController::class, 'suspend']);

        // Transaction management
        Route::get('/transactions', [AdminTransactionController::class, 'index']);
        Route::get('/transactions/stats', [AdminTransactionController::class, 'stats']);
        Route::get('/transactions/{id}', [AdminTransactionController::class, 'show']);
        Route::get('/transactions/export', [AdminTransactionController::class, 'export']);

        // Settings management
        Route::get('/settings', [AdminSettingController::class, 'index']);
        Route::get('/settings/business', [AdminSettingController::class, 'business']);
        Route::put('/settings/{key}', [AdminSettingController::class, 'update']);
        Route::post('/settings/batch', [AdminSettingController::class, 'updateBatch']);
        Route::post('/settings/reset', [AdminSettingController::class, 'reset']);
    });

    // Public settings (accessible by all authenticated users)
    Route::get('/settings/public', [AdminSettingController::class, 'public']);
});
