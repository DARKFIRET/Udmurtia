<?php

use App\Http\Controllers\Admin\BookingController;
use App\Http\Controllers\Admin\RoutePointController;
use App\Http\Controllers\Admin\RouteController;
use App\Http\Controllers\Admin\UdmurtiaController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Admin\ExcursionController;
use App\Http\Controllers\PhotoController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


// USER ____________________________________________________________________
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'getUser']);
    Route::post('/logout', [AuthController::class, 'logout']);
});

// ___________________________________________________________________

// ФОТОГРАФИИ _____________________________________________________________

Route::get('/photos', [PhotoController::class, 'getPhotos']);
Route::get('/photos/{id}', [PhotoController::class, 'getPhoto']);
Route::get('/routes', [RouteController::class, 'index']);
Route::get('/routes/{id}', [RouteController::class, 'show']);
Route::post('/routes/search', [ExcursionController::class, 'search']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/photos', [PhotoController::class, 'upload']);
});

// __________________________________________________________________

// ИНФОРМАЦИЯ ОБ УДМУРТИИ _____________________________________________________

Route::get('/udmurtia', [UdmurtiaController::class, 'get']); // Получение информации
Route::middleware('auth:sanctum')->group(function () {

});

// __________________________________________________________________

// АДМИН СОЗДАНИЕ ТУР МАРШРУТА _____________________________________________________





Route::middleware(['auth:sanctum'])->group(function () {
    Route::prefix('admin')->group(function () {
        // Route routes
        Route::post('/routes', [RouteController::class, 'store']);
        Route::put('/routes/{id}', [RouteController::class, 'update']);
        Route::patch('/routes/{id}', [RouteController::class, 'patch']);
        Route::delete('/routes/{id}', [RouteController::class, 'destroy']);

        // RoutePoint routes
        Route::get('/route-points', [RoutePointController::class, 'index']);
        Route::post('/route-points', [RoutePointController::class, 'store']);
        Route::put('/route-points/{id}', [RoutePointController::class, 'update']);
        Route::delete('/route-points/{id}', [RoutePointController::class, 'destroy']);
        Route::post('/excursions', [ExcursionController::class, 'store']);
        Route::put('/excursions/{id}', [ExcursionController::class, 'update']);
        Route::delete('/excursions/{id}', [ExcursionController::class, 'destroy']);

        Route::post('/udmurtia', [UdmurtiaController::class, 'store']); // Создание/перезапись
        Route::patch('/udmurtia', [UdmurtiaController::class, 'patch']); // Частичное обновление
    });
});
Route::get('/admin/routes', [RouteController::class, 'index']);
Route::get('/excursions', [ExcursionController::class, 'index']);
Route::get('/excursions/{id}', [ExcursionController::class, 'show']);
// БРОНИРОВАНИЯ _____________________________________________________________

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/excursions/{excursionId}/book', [BookingController::class, 'book']);
    Route::patch('/excursions/{excursionId}/cancel', [BookingController::class, 'cancel']);
    Route::get('/bookings', [BookingController::class, 'getUserBookings']);
});

// __________________________________________________________________