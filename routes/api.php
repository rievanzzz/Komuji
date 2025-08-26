<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

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
Route::post('/register', [AuthController::class, 'register']);
Route::post('/verify-otp', [AuthController::class, 'verifyOtp']); // <-- ini ditambah
Route::post('/login', [AuthController::class, 'login']);
Route::get('/test', function () {
    return response()->json(['message' => 'API is working!']);
});

// Protected routes
Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    // User routes
    Route::get('/user', function (Request $request) {
        return response()->json($request->user());
    });

    // Logout
    Route::post('/logout', [AuthController::class, 'logout']);

    // Hanya Admin Aplikasi
    Route::middleware('role:admin_aplikasi')->group(function () {
        Route::get('/admin-aplikasi/dashboard', function () {
            return response()->json([
                'message' => 'Halo Admin Aplikasi, kamu punya semua akses.'
            ]);
        });
    });

    // Hanya Admin Acara
    Route::middleware('role:admin_acara')->group(function () {
        Route::get('/admin-acara/dashboard', function () {
            return response()->json([
                'message' => 'Halo Admin Acara, kamu bisa kelola event kamu.'
            ]);
        });
    });

    // Hanya Peserta
    Route::middleware('role:peserta')->group(function () {
        Route::get('/peserta/dashboard', function () {
            return response()->json([
                'message' => 'Halo Peserta, kamu bisa daftar & ikut event.'
            ]);
        });
    });
});
