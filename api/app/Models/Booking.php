<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $table = 'bookings';

    protected $fillable = [
        'route_id',
        'user_id',
        'slots',
        'canceled',
    ];

    protected $casts = [
        'canceled' => 'boolean',
    ];

    public function route()
    {
        return $this->belongsTo(Route::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
