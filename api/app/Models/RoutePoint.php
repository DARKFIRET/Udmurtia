<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoutePoint extends Model
{
    protected $fillable = [
        'route_id',
        'description',
        'photo_path',
        'order',
    ];

    public function route()
    {
        return $this->belongsTo(Route::class);
    }
    public function routes()
    {
        return $this->belongsToMany(Route::class, 'route_route_point');
    }

    public function routePointDays()
    {
        return $this->hasMany(RoutePointDay::class, 'route_point_id');
    }
}