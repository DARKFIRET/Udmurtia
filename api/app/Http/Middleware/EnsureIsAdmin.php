<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EnsureIsAdmin
{
    public function handle(Request $request, Closure $next)
    {
        if (!Auth::user() || !Auth::user()->is_admin) {
            return response()->json(['message' => 'Unauthorized: Admin access required'], 403);
        }

        return $next($request);
    }
}
