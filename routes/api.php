<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

// ✅ Public routes (semua bisa akses)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/verify-otp', [AuthController::class, 'verifyOtp']); // <-- ini ditambah
Route::post('/login', [AuthController::class, 'login']);

// ✅ Protected routes (butuh login / token)
Route::middleware('auth:sanctum')->group(function () {
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
