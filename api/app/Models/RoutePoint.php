<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RoutePoint extends Model
{
    use HasFactory;

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
}