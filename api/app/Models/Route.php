<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Route extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'start_location',
        'start_date',
        'start_time',
        'days',
        'slots',
        'age_restriction',
        'cost',
    ];

    // чтобы в JSON всегда был available_slots
    protected $appends = ['available_slots'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function points()
    {
        return $this->hasMany(RoutePoint::class)->orderBy('order');
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function getAvailableSlotsAttribute()
{
    $bookedSlots = $this->bookings()
        ->where('canceled', false)
        ->sum('slots');

    return max($this->slots - $bookedSlots, 0);
}

}
