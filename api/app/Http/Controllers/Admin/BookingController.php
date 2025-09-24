<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Excursion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class BookingController extends Controller
{
    /**
     * Записать пользователя на экскурсию
     */
    public function book(Request $request, $excursionId)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'slots' => 'required|integer|min:1',
        ]);

        $excursion = Excursion::findOrFail($excursionId);

        // Считаем доступные слоты
        $bookedSlots = $excursion->bookings()->where('canceled', false)->sum('slots');
        $availableSlots = $excursion->all_people - $bookedSlots;

        if ($validated['slots'] > $availableSlots) {
            return response()->json(['message' => 'Not enough available slots'], 400);
        }

        // Проверяем, есть ли у пользователя уже бронь на эту экскурсию
        $existingBooking = Booking::where('excursion_id', $excursionId)
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
                'excursion_id' => $excursionId,
                'slots' => $existingBooking->slots,
            ]);

            return response()->json([
                'message' => 'Booking updated',
                'booking' => $existingBooking,
            ]);
        }

        // Создаём новую бронь
        $booking = Booking::create([
            'excursion_id' => $excursionId,
            'user_id' => $user->id,
            'slots' => $validated['slots'],
            'canceled' => false,
        ]);

        Log::info('Booking created:', [
            'user_id' => $user->id,
            'excursion_id' => $excursionId,
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
    public function cancel(Request $request, $excursionId)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $excursion = Excursion::findOrFail($excursionId);

        // Проверка — можно ли отменять
        if (now()->diffInDays(\Carbon\Carbon::parse($excursion->start_date), false) < 7) {
            return response()->json(['message' => 'Cancellation not allowed less than 7 days before start'], 403);
        }

        // Ищем бронь пользователя на экскурсию
        $booking = Booking::where('excursion_id', $excursionId)
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
                'excursion_id' => $excursionId,
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
            'excursion_id' => $excursionId,
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

        $bookings = Booking::with('excursion.route.routePoints')
            ->where('user_id', $user->id)
            ->where('canceled', false)
            ->get()
            ->map(function ($booking) {
                $bookedSlots = $booking->slots;
                $totalSlots = $booking->excursion->all_people;
                $allBookedSlots = $booking->excursion->bookings()->where('canceled', false)->sum('slots');
                $discountPricePerSlot = $this->calculateDiscountPrice($booking->excursion->cost, $bookedSlots, $allBookedSlots, $totalSlots);
                $totalCost = $discountPricePerSlot * $bookedSlots;

                return [
                    'excursion_id' => $booking->excursion_id,
                    'start_point' => $booking->excursion->start_point,
                    'start_date' => $booking->excursion->start_date,
                    'start_time' => $booking->excursion->start_time,
                    'slots_booked' => $bookedSlots,
                    'discount_price_per_slot' => $discountPricePerSlot,
                    'total_cost' => $totalCost,
                    'route' => $booking->excursion->route ? [
                        'id' => $booking->excursion->route->id,
                        'description' => $booking->excursion->route->description,
                        'route_points' => $booking->excursion->route->routePoints->map(function ($point) {
                            return [
                                'id' => $point->id,
                                'description' => $point->description,
                                'photo_url' => $point->photo_path ? url(Storage::url($point->photo_path)) : null,
                                'order' => $point->order,
                                'day' => $point->day,
                            ];
                        }),
                    ] : null,
                ];
            });

        // Вычисляем общую стоимость всех броней
        $totalCostAllBookings = $bookings->sum(function ($booking) {
            $totalSlots = $booking['excursion_id'] ? Excursion::find($booking['excursion_id'])->all_people : 0;
            $allBookedSlots = Booking::where('excursion_id', $booking['excursion_id'])->where('canceled', false)->sum('slots');
            $discountPricePerSlot = $this->calculateDiscountPrice(Excursion::find($booking['excursion_id'])->cost, $booking['slots_booked'], $allBookedSlots, $totalSlots);
            return $discountPricePerSlot * $booking['slots_booked'];
        });

        return response()->json([
            'bookings' => $bookings,
            'total_cost_all_bookings' => $totalCostAllBookings,
        ]);
    }

    private function calculateDiscountPrice($cost, $slotsBooked, $allBookedSlots, $totalSlots)
    {
        $availableSlots = max(0, $totalSlots - $allBookedSlots);
        $basePrice = $cost;

        // Определяем пороги для скидок
        $firstThreshold = $totalSlots * 0.3; // 30% от общего числа мест с 25% скидкой
        $secondThreshold = $totalSlots * 0.5; // 50% от общего числа мест с 10% скидкой

        $remainingSlotsWithDiscount = min($secondThreshold - $allBookedSlots + $slotsBooked, $slotsBooked);
        $slotsWith25Discount = min($firstThreshold - ($allBookedSlots - $slotsBooked), $slotsBooked);
        $slotsWith10Discount = max(0, min($remainingSlotsWithDiscount - $slotsWith25Discount, $slotsBooked - $slotsWith25Discount));
        $slotsWithoutDiscount = max(0, $slotsBooked - $slotsWith25Discount - $slotsWith10Discount);

        // Расчёт общей стоимости для забронированных слотов
        $totalCost = ($slotsWith25Discount * $basePrice * 0.75) + // 25% скидка
                     ($slotsWith10Discount * $basePrice * 0.90) + // 10% скидка
                     ($slotsWithoutDiscount * $basePrice);       // Без скидки

        // Средняя цена за слот
        $discountPricePerSlot = $slotsBooked > 0 ? $totalCost / $slotsBooked : $basePrice;

        return $discountPricePerSlot;
    }
}