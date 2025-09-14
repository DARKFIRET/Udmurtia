<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'first_name',
        'last_name',
        'patronymic',
        'email',
        'password',
        'birth_date',
        'is_admin',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'is_admin', // Hide is_admin in JSON responses
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'birth_date' => 'date',
        'is_admin' => 'boolean',
    ];

    public function photos()
    {
        return $this->hasMany(Photo::class);
    }

    public function routes()
    {
        return $this->hasMany(Route::class);
    }
}
