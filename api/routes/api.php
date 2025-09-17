<?php

use App\Http\Controllers\Admin\BookingController;
use App\Http\Controllers\Admin\RouteController;
use App\Http\Controllers\Admin\UdmurtiaController;
use App\Http\Controllers\AuthController;
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
Route::post('/routes/search', [RouteController::class, 'search']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/photos', [PhotoController::class, 'upload']);
});

// __________________________________________________________________

// ИНФОРМАЦИЯ ОБ УДМУРТИИ _____________________________________________________

Route::get('/udmurtia', [UdmurtiaController::class, 'get']); // Получение информации
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/udmurtia', [UdmurtiaController::class, 'store']); // Создание/перезапись
    Route::patch('/udmurtia', [UdmurtiaController::class, 'patch']); // Частичное обновление
});

// __________________________________________________________________

// АДМИН СОЗДАНИЕ ТУР МАРШРУТА _____________________________________________________

Route::middleware(['auth:sanctum'])->group(function () {
    Route::prefix('admin')->group(function () {
        Route::post('/routes', [RouteController::class, 'store']);
        Route::put('/routes/{id}', [RouteController::class, 'update']);
        Route::patch('/routes/{id}', [RouteController::class, 'patch']);
        Route::delete('/routes/{id}', [RouteController::class, 'destroy']);
    });
});

// БРОНИРОВАНИЯ _____________________________________________________________

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/routes/{routeId}/book', [BookingController::class, 'book']); // Запись на экскурсию
    Route::patch('/routes/{routeId}/cancel', [BookingController::class, 'cancel']); // Отмена участия
    Route::get('/bookings', [BookingController::class, 'getUserBookings']); // Получение бронирований пользователя
});

// __________________________________________________________________