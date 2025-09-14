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
        $bookedSlots = $route->bookings()->where('canceled', false)->sum('slots');
        $availableSlots = $route->available_slots;

        if ($validated['slots'] > $availableSlots) {
            return response()->json(['message' => 'Not enough available slots'], 400);
        }

        $booking = Booking::create([
            'route_id' => $routeId,
            'user_id' => $user->id,
            'slots' => $validated['slots'],
            'canceled' => false,
        ]);

        Log::info('Booking created:', ['user_id' => $user->id, 'route_id' => $routeId, 'slots' => $validated['slots']]);
        return response()->json(['message' => 'Booking successful', 'booking' => $booking], 201);
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

        $bookingId = $request->input('booking_id'); // Опциональный параметр для отмены конкретного заказа

        if ($bookingId) {
            // Отмена конкретного заказа
            $booking = Booking::where('id', $bookingId)
                ->where('route_id', $routeId)
                ->where('user_id', $user->id)
                ->first();
            if (!$booking) {
                return response()->json(['message' => 'Booking not found or not authorized'], 404);
            }
            $booking->update(['canceled' => true]);
            Log::info('Booking canceled:', ['booking_id' => $bookingId, 'user_id' => $user->id, 'route_id' => $routeId]);
            return response()->json(['message' => 'Booking canceled', 'booking' => $booking]);
        } else {
            // Отмена всех заказов пользователя на данный маршрут
            $bookings = Booking::where('route_id', $routeId)
                ->where('user_id', $user->id)
                ->where('canceled', false)
                ->get();
            if ($bookings->isEmpty()) {
                return response()->json(['message' => 'No active bookings found'], 404);
            }

            $bookings->each(function ($booking) {
                $booking->update(['canceled' => true]);
            });
            Log::info('All bookings canceled for user:', ['user_id' => $user->id, 'route_id' => $routeId]);
            return response()->json(['message' => 'All bookings canceled', 'bookings' => $bookings]);
        }
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
