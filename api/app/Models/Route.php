<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Route extends Model
{
    protected $fillable = [
        'description',
        // other fields
    ];

    public function excursions()
    {
        return $this->hasMany(Excursion::class);
    }

    public function routePoints()
    {
        return $this->belongsToMany(RoutePoint::class, 'route_route_point');
    }

    public function routePointDays()
    {
        return $this->hasMany(RoutePointDay::class, 'route_id');
    }
}