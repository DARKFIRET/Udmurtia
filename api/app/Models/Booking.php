<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $fillable = [
        'excursion_id', // Changed from route_id
        'user_id',
        'slots',
        'canceled',
    ];

    public function excursion()
    {
        return $this->belongsTo(Excursion::class); // Changed from Route
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}