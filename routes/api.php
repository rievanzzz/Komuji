<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\Admin\PanitiaController as AdminPanitiaController;
use App\Http\Controllers\Api\Admin\TransactionController as AdminTransactionController;
use App\Http\Controllers\Api\Admin\SettingController as AdminSettingController;
use App\Http\Controllers\Api\Admin\AdminController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\RegistrationController;
use App\Http\Controllers\Api\PanitiaUpgradeController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\CertificateController;
use App\Http\Controllers\Api\ContactMessageController;
use App\Http\Controllers\Api\TicketCategoryController;
use App\Models\Category;

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

// Password reset routes - Using OTP system
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Payment routes
Route::match(['get','post'], '/payment/notification', [\App\Http\Controllers\Api\PaymentController::class, 'handleNotification']);
Route::get('/payment/config', [\App\Http\Controllers\Api\PaymentController::class, 'clientConfig']);

// Public routes
Route::get('/test', function () {
    return response()->json(['message' => 'API is working!']);
});

// Public contact endpoint
Route::post('/contact', [ContactMessageController::class, 'store']);

// Public: ticket categories for an event
Route::get('/events/{event}/ticket-categories', [TicketCategoryController::class, 'index']);

// Public categories list
Route::get('/categories', function () {
    $categories = Category::select('id', 'nama_kategori as name', 'deskripsi')
        ->orderBy('nama_kategori')
        ->get();
    return response()->json(['data' => $categories]);
});

// Public banners (max 3 active)
Route::get('/banners', [AdminSettingController::class, 'publicBanners']);

// Authentication routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/register-panitia', [AuthController::class, 'registerPanitia']);
Route::get('/registration-options', [AuthController::class, 'getRegistrationOptions']);
Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/resend-otp', [AuthController::class, 'resendOtp']);
Route::post('/login', [AuthController::class, 'login']);

// Public event routes
Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{event}', [EventController::class, 'show']);
Route::get('/events/{event}/ticket-categories', [TicketCategoryController::class, 'index']);

// Top 10 Events dengan Peserta Terbanyak (Public)
Route::get('/top-events', [EventController::class, 'topEvents']);

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

    // Organizer routes
    Route::middleware(['panitia'])->prefix('organizer')->group(function () {
        Route::get('/profile', [UserController::class, 'getOrganizerProfile']);
        Route::put('/profile', [UserController::class, 'updateOrganizerProfile']);
        Route::get('/earnings', [UserController::class, 'getOrganizerEarnings']);

        // Withdrawal routes
        Route::get('/bank-accounts', [\App\Http\Controllers\Api\WithdrawalController::class, 'getBankAccounts']);
        Route::post('/bank-accounts', [\App\Http\Controllers\Api\WithdrawalController::class, 'addBankAccount']);
        Route::post('/withdrawals', [\App\Http\Controllers\Api\WithdrawalController::class, 'createWithdrawal']);
        Route::get('/withdrawals', [\App\Http\Controllers\Api\WithdrawalController::class, 'getWithdrawalHistory']);
        Route::get('/withdrawal-summary', [\App\Http\Controllers\Api\WithdrawalController::class, 'getWithdrawalSummary']);
    });

    // Panitia upgrade routes
    Route::get('/upgrade/check-eligibility', [PanitiaUpgradeController::class, 'checkEligibility']);
    Route::get('/upgrade/status', [PanitiaUpgradeController::class, 'getStatus']);
    Route::post('/upgrade/to-panitia', [PanitiaUpgradeController::class, 'upgrade']);

    // Payment routes (protected)
    Route::post('/payment/event', [\App\Http\Controllers\Api\PaymentController::class, 'createEventPayment']);
    Route::post('/payment/premium', [\App\Http\Controllers\Api\PaymentController::class, 'createPremiumPayment']);
    Route::get('/payment/status/{transactionId}', [\App\Http\Controllers\Api\PaymentController::class, 'getTransactionStatus']);
    Route::get('/payment/check/{transactionId}', [\App\Http\Controllers\Api\PaymentController::class, 'checkPaymentStatus']);

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
    Route::get('/registrations/{registration}', [RegistrationController::class, 'show']);

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

        // Organizer specific routes
        Route::get('/organizer/events', [EventController::class, 'index']);
        Route::get('/organizer/profile', [UserController::class, 'getOrganizerProfile']);
        Route::put('/organizer/profile', [UserController::class, 'updateOrganizerProfile']);

        // Ticket category management
        Route::post('/events/{event}/ticket-categories', [TicketCategoryController::class, 'store']);
        Route::put('/events/{event}/ticket-categories/{ticketCategory}', [TicketCategoryController::class, 'update']);
        Route::delete('/events/{event}/ticket-categories/{ticketCategory}', [TicketCategoryController::class, 'destroy']);

        // Event registrations management
        Route::get('/events/{event}/registrations', [EventController::class, 'registrations']);
        Route::get('/events/{event}/export-attendance', [EventController::class, 'exportAttendance'])
            ->name('events.export-attendance');

        // Export Excel Peserta dengan Status Kehadiran
        Route::get('/events/{event}/export-participants', [EventController::class, 'exportParticipantsExcel'])
            ->name('events.export-participants');

        // Generate Daftar Kehadiran untuk Print
        Route::get('/events/{event}/attendance-list', [EventController::class, 'generateAttendanceList'])
            ->name('events.attendance-list');

        // Attendance verification for organizer/admin (scan QR or manual token)
        Route::post('/organizer/events/{event}/attendance/verify', [AttendanceController::class, 'verify']);
        Route::get('/organizer/events/{event}/attendance/stats', [AttendanceController::class, 'stats']);

        // Certificates (organizer)
        Route::get('/organizer/certificate-templates', [CertificateController::class, 'templates']);
        Route::post('/organizer/certificate-templates', [CertificateController::class, 'createTemplate']);
        Route::get('/organizer/events/{event}/certificates/settings', [CertificateController::class, 'settings']);
        Route::post('/organizer/events/{event}/certificates/settings', [CertificateController::class, 'updateSettings']);
        Route::post('/organizer/events/{event}/certificates/preview', [CertificateController::class, 'preview']);
        Route::get('/organizer/events/{event}/certificates/issuance', [CertificateController::class, 'issuanceList']);
        Route::post('/organizer/registrations/{registration}/certificate/issue', [CertificateController::class, 'issue']);
        Route::post('/organizer/registrations/{registration}/certificate/reject', [CertificateController::class, 'reject']);

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
        Route::get('/settings', [AdminController::class, 'getSettings']);
        Route::put('/settings', [AdminController::class, 'updateSettings']);

        // Platform (admin) primary bank account
        Route::get('/platform-bank-account', [AdminController::class, 'getPlatformBankAccount']);
        Route::put('/platform-bank-account', [AdminController::class, 'updatePlatformBankAccount']);

        // Banner management
        Route::get('/banners', [AdminSettingController::class, 'indexBanners']);
        Route::post('/banners', [AdminSettingController::class, 'createBanner']);
        Route::post('/banners/activate', [AdminSettingController::class, 'activateBanners']);
        Route::put('/banners/{id}', [AdminSettingController::class, 'updateBanner']);
        Route::delete('/banners/{id}', [AdminSettingController::class, 'deleteBanner']);

        // Contact messages management
        Route::get('/contact-messages', [ContactMessageController::class, 'index']);
        Route::put('/contact-messages/{contactMessage}', [ContactMessageController::class, 'update']);
        Route::delete('/contact-messages/{contactMessage}', [ContactMessageController::class, 'destroy']);

        // Additional admin endpoints
        Route::get('/panitias-management', [AdminController::class, 'getPanitias']);
        Route::get('/transactions-admin', [AdminController::class, 'getTransactions']);
        Route::get('/revenue-stats', [AdminController::class, 'getRevenueStats']);
        Route::get('/revenue-dashboard', [AdminController::class, 'getRevenueDashboard']);
        Route::get('/reports', [AdminController::class, 'getReports']);

        // Withdrawal management routes
        Route::get('/withdrawals/pending', [AdminController::class, 'getPendingWithdrawals']);
        Route::get('/withdrawals', [AdminController::class, 'getAllWithdrawals']);
        Route::post('/withdrawals/{id}/approve', [AdminController::class, 'approveWithdrawal']);
        Route::post('/withdrawals/{id}/reject', [AdminController::class, 'rejectWithdrawal']);

        // User Management routes
        Route::get('/all-users', [UserController::class, 'getAllUsers']);
        Route::patch('/users/{id}/toggle-status', [UserController::class, 'toggleStatus']);
        Route::delete('/users/{id}', [UserController::class, 'deleteUser']);
        Route::get('/users/{id}/events', [UserController::class, 'getUserEvents']);
        Route::post('/organizers/{id}/approve', [UserController::class, 'approveOrganizer']);
        Route::post('/organizers/{id}/reject', [UserController::class, 'rejectOrganizer']);
        Route::post('/organizers/{id}/suspend', [UserController::class, 'suspendOrganizer']);
    });

    // Public settings (accessible by all authenticated users)
    Route::get('/settings/public', [AdminSettingController::class, 'public']);
});
