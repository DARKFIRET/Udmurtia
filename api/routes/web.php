<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;


Route::get('/student', function () {
    return 'web';
}); 


Route::post('/test', function (Request $request) {
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:users',
        'password' => 'required|min:8|confirmed'
    ]);
    
    return response()->json([
        'success' => true,
        'message' => 'Пользователь создан',
        'user' => $validated['name']
    ], 201);

});