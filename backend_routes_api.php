<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\UserManagementController;

/*
|--------------------------------------------------------------------------
| API Routes untuk User Management
|--------------------------------------------------------------------------
|
| Tambahkan routes ini ke file routes/api.php yang sudah ada
|
*/

// Routes untuk Admin - User Management
Route::middleware(['auth:sanctum'])->group(function () {
    
    // Get all users (untuk admin)
    Route::get('/admin/all-users', [UserManagementController::class, 'getAllUsers']);
    
    // Toggle user active status
    Route::patch('/users/{id}/toggle-status', [UserManagementController::class, 'toggleStatus']);
    
    // Delete user
    Route::delete('/users/{id}', [UserManagementController::class, 'deleteUser']);
    
    // Get user events/registrations
    Route::get('/users/{id}/events', [UserManagementController::class, 'getUserEvents']);
    
    // Approve organizer
    Route::post('/organizers/{id}/approve', [UserManagementController::class, 'approveOrganizer']);
    
    // Reject organizer
    Route::post('/organizers/{id}/reject', [UserManagementController::class, 'rejectOrganizer']);
});
