<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Test\EventTestController;

Route::get('/', function () {
    return view('welcome');
});

// Debug route for testing event updates
Route::get('/debug/event/{id}/update', [\App\Http\Controllers\Test\EventTestController::class, 'debugUpdate'])
    ->name('debug.event.update');

// Test Routes
Route::prefix('test')->group(function () {
    // Event routes
    Route::get('/events/create', [EventTestController::class, 'create'])->name('test.events.create');
    Route::post('/events', [EventTestController::class, 'store'])->name('test.events.store');
    Route::get('/events/{id}/edit', [EventTestController::class, 'edit'])->name('test.events.edit');
    Route::put('/events/{id}', [EventTestController::class, 'update'])->name('test.events.update');
});
