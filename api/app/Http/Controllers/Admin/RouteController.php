<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Route;
use App\Models\RoutePoint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class RouteController extends Controller
{
    public function index()
    {
        $routes = Route::with('routePoints')->get()->map(function ($route) {
            return [
                'id' => $route->id,
                'description' => $route->description,
                'route_points' => $route->routePoints->map(function ($point) {
                    return [
                        'id' => $point->id,
                        'description' => $point->description,
                        'photo_url' => $point->photo_path ? Storage::url($point->photo_path) : null,
                        'order' => $point->order,
                        'day' => $point->day,
                    ];
                }),
                'created_at' => $route->created_at,
                'updated_at' => $route->updated_at,
            ];
        });

        return response()->json(['routes' => $routes]);
    }

    public function show($id)
    {
        try {
            $route = Route::with('routePoints')->findOrFail($id);
            return response()->json([
                'id' => $route->id,
                'description' => $route->description,
                'route_points' => $route->routePoints->map(function ($point) {
                    return [
                        'id' => $point->id,
                        'description' => $point->description,
                        'photo_url' => $point->photo_path ? Storage::url($point->photo_path) : null,
                        'order' => $point->order,
                        'day' => $point->day,
                    ];
                }),
                'created_at' => $route->created_at,
                'updated_at' => $route->updated_at,
            ]);
        } catch (\Exception $e) {
            \Log::error('Route not found', ['error' => $e->getMessage(), 'id' => $id]);
            return response()->json(['message' => 'Route not found', 'error' => $e->getMessage()], 404);
        }
    }

    public function store(Request $request)
    {
        if (!Auth::check() || !Auth::user()->is_admin) {
            \Log::warning('Unauthorized access attempt', ['user' => Auth::id(), 'is_admin' => Auth::user()->is_admin ?? false]);
            return response()->json(['message' => 'Unauthorized: Admin access required'], 403);
        }

        try {
            $validated = $request->validate([
                'description' => 'required|string|max:1000',
                'route_points' => 'required|array',
                'route_points.*' => 'exists:route_points,id',
            ]);

            \Log::info('POST Request Data:', $request->all());

            $route = Route::create([
                'description' => $validated['description'],
            ]);

            $route->routePoints()->attach($validated['route_points']);

            return response()->json([
                'message' => 'Route created',
                'route' => [
                    'id' => $route->id,
                    'description' => $route->description,
                    'route_points' => $route->routePoints->map(function ($point) {
                        return [
                            'id' => $point->id,
                            'description' => $point->description,
                            'photo_url' => $point->photo_path ? Storage::url($point->photo_path) : null,
                            'order' => $point->order,
                            'day' => $point->day,
                        ];
                    }),
                    'created_at' => $route->created_at,
                    'updated_at' => $route->updated_at,
                ],
            ], 201);
        } catch (ValidationException $e) {
            \Log::error('Validation Error:', $e->errors());
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            \Log::error('Creation Failed:', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'Creation failed', 'error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        if (!Auth::check() || !Auth::user()->is_admin) {
            \Log::warning('Unauthorized access attempt', ['user' => Auth::id(), 'is_admin' => Auth::user()->is_admin ?? false]);
            return response()->json(['message' => 'Unauthorized: Admin access required'], 403);
        }

        try {
            $route = Route::findOrFail($id);

            \Log::info('PUT Request Data:', $request->all());

            $validated = $request->validate([
                'description' => 'sometimes|string|max:1000',
                'route_points' => 'sometimes|array',
                'route_points.*' => 'exists:route_points,id',
            ]);

            $data = [];
            if (isset($validated['description'])) {
                $data['description'] = $validated['description'];
            }
            $route->update($data);

            if (isset($validated['route_points'])) {
                $route->routePoints()->sync($validated['route_points']);
            }

            return response()->json([
                'message' => 'Route updated',
                'route' => [
                    'id' => $route->id,
                    'description' => $route->description,
                    'route_points' => $route->routePoints->map(function ($point) {
                        return [
                            'id' => $point->id,
                            'description' => $point->description,
                            'photo_url' => $point->photo_path ? Storage::url($point->photo_path) : null,
                            'order' => $point->order,
                            'day' => $point->day,
                        ];
                    }),
                    'created_at' => $route->created_at,
                    'updated_at' => $route->updated_at,
                ],
            ]);
        } catch (ValidationException $e) {
            \Log::error('Validation Error:', $e->errors());
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            \Log::error('Update Failed:', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'Update failed', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        if (!Auth::check() || !Auth::user()->is_admin) {
            \Log::warning('Unauthorized access attempt', ['user' => Auth::id(), 'is_admin' => Auth::user()->is_admin ?? false]);
            return response()->json(['message' => 'Unauthorized: Admin access required'], 403);
        }

        try {
            $route = Route::findOrFail($id);
            $route->delete();

            return response()->json(['message' => 'Route deleted']);
        } catch (\Exception $e) {
            \Log::error('Deletion Failed:', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'Deletion failed', 'error' => $e->getMessage()], 500);
        }
    }
}