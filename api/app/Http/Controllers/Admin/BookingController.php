<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class BookingController extends Controller
{
    /**
     * Записать пользователя на экскурсию
     */
    public function book(Request $request, $routeId)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'slots' => 'required|integer|min:1',
        ]);

        $route = Route::findOrFail($routeId);

        // Считаем доступные слоты
        $bookedSlots = $route->bookings()->where('canceled', false)->sum('slots');
        $availableSlots = $route->slots - $bookedSlots;

        if ($validated['slots'] > $availableSlots) {
            return response()->json(['message' => 'Not enough available slots'], 400);
        }

        // Проверяем, есть ли у пользователя уже бронь на эту экскурсию
        $existingBooking = Booking::where('route_id', $routeId)
            ->where('user_id', $user->id)
            ->where('canceled', false)
            ->first();

        if ($existingBooking) {
            // Увеличиваем количество мест
            $existingBooking->update([
                'slots' => $existingBooking->slots + $validated['slots'],
            ]);

            Log::info('Booking updated (slots increased):', [
                'user_id' => $user->id,
                'route_id' => $routeId,
                'slots' => $existingBooking->slots,
            ]);

            return response()->json([
                'message' => 'Booking updated',
                'booking' => $existingBooking,
            ]);
        }

        // Создаём новую бронь
        $booking = Booking::create([
            'route_id' => $routeId,
            'user_id' => $user->id,
            'slots' => $validated['slots'],
            'canceled' => false,
        ]);

        Log::info('Booking created:', [
            'user_id' => $user->id,
            'route_id' => $routeId,
            'slots' => $validated['slots'],
        ]);

        return response()->json([
            'message' => 'Booking successful',
            'booking' => $booking,
        ], 201);
    }


    /**
     * Отменить участие в экскурсии
     */
    public function cancel(Request $request, $routeId)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $route = Route::findOrFail($routeId);

        // Проверка — можно ли отменять
        if (now()->diffInDays(\Carbon\Carbon::parse($route->start_date), false) < 7) {
            return response()->json(['message' => 'Cancellation not allowed less than 7 days before start'], 403);
        }

        // Ищем бронь пользователя на экскурсию
        $booking = Booking::where('route_id', $routeId)
            ->where('user_id', $user->id)
            ->where('canceled', false)
            ->first();

        if (!$booking) {
            return response()->json(['message' => 'No active booking found'], 404);
        }

        $slotsToCancel = (int) $request->input('slots', 0);

        if ($slotsToCancel > 0 && $slotsToCancel < $booking->slots) {
            // Частичная отмена
            $booking->update(['slots' => $booking->slots - $slotsToCancel]);

            Log::info('Booking partially canceled', [
                'user_id' => $user->id,
                'route_id' => $routeId,
                'slots_left' => $booking->slots,
            ]);

            return response()->json([
                'message' => 'Booking partially canceled',
                'booking' => $booking,
            ]);
        }

        // Полная отмена
        $booking->update(['canceled' => true]);

        Log::info('Booking canceled', [
            'user_id' => $user->id,
            'route_id' => $routeId,
        ]);

        return response()->json([
            'message' => 'Booking canceled',
            'booking' => $booking,
        ]);
    }

    /**
     * Получить информацию о бронированиях текущего пользователя
     */
    public function getUserBookings()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $bookings = Booking::with('route')
            ->where('user_id', $user->id)
            ->where('canceled', false)
            ->get()
            ->map(function ($booking) {
                return [
                    'route_id' => $booking->route_id,
                    'start_location' => $booking->route->start_location,
                    'start_date' => $booking->route->start_date,
                    'start_time' => $booking->route->start_time,
                    'slots_booked' => $booking->slots,
                ];
            });

        return response()->json(['bookings' => $bookings]);
    }
}
