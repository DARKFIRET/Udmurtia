<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoutePointDay extends Model
{
    protected $fillable = [
        'route_id',
        'route_point_id',
        'day',
    ];

    public function route()
    {
        return $this->belongsTo(Route::class);
    }

    public function routePoint()
    {
        return $this->belongsTo(RoutePoint::class);
    }
}