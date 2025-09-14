<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        try {
            $validated = $request->validate([
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'patronymic' => 'nullable|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8',
                'birth_date' => 'required|date',
            ]);

            $user = User::create($validated);
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json(['token' => $token], 201);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Registration failed',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }

    public function login(Request $request)
    {
        try {
            $validated = $request->validate([
                'email' => 'required|string|email',
                'password' => 'required|string',
            ]);

            if (!Auth::attempt($validated)) {
                return response()->json(['message' => 'Invalid credentials'], 401);
            }

            $user = Auth::user();
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json(['token' => $token]);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Login failed', 'error' => $e->getMessage()], 500);
        }
    }

    public function getUser(Request $request)
    {
        try {
            return response()->json($request->user());
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to retrieve user', 'error' => $e->getMessage()], 500);
        }
    }

    public function logout(Request $request)
    {
        try {
            $request->user()->currentAccessToken()->delete();
            return response()->json(['message' => 'Logged out']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Logout failed', 'error' => $e->getMessage()], 500);
        }
    }
}