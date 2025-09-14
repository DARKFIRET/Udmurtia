<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Udmurtia extends Model
{
    protected $table = 'udmurtia';

    protected $fillable = [
        'title',
        'description',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}
