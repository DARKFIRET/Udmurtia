<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Excursion extends Model
{
    protected $fillable = [
        'start_point',
        'start_date',
        'start_time',
        'all_days',
        'all_people',
        'age_limit',
        'route_id',
    ];

    public function route()
    {
        return $this->belongsTo(Route::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}