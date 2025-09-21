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
        'day',
    ];

    public function route()
    {
        return $this->belongsTo(Route::class);
    }
    public function routes()
    {
        return $this->belongsToMany(Route::class, 'route_route_point');
    }
}