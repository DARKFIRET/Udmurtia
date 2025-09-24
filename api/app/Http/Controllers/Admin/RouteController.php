<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Route;
use App\Models\RoutePoint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\RoutePointDay;
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
                'days' => 'required|array', // Новый массив дней
                'days.*' => 'nullable|integer|min:1', // Каждый день — целое число
            ]);

            \Log::info('POST Request Data:', $request->all());

            $route = Route::create([
                'description' => $validated['description'],
            ]);

            // Привязываем route_points через pivot-таблицу route_route_point
            $route->routePoints()->attach($validated['route_points']);

            // Сохраняем дни для каждой точки
            foreach ($validated['route_points'] as $index => $routePointId) {
                $day = $validated['days'][$index] ?? null;
                RoutePointDay::create([
                    'route_id' => $route->id,
                    'route_point_id' => $routePointId,
                    'day' => $day,
                ]);
            }

            $route->load('routePoints', 'routePointDays'); // Перезагружаем отношения

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
                        ];
                    }),
                    'days' => $route->routePointDays->map(function ($dayEntry) {
                        return [
                            'route_point_id' => $dayEntry->route_point_id,
                            'day' => $dayEntry->day,
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
                // Detach all current route points and update with new ones
                RoutePoint::where('route_id', $route->id)->update(['route_id' => null]);
                RoutePoint::whereIn('id', $validated['route_points'])->update(['route_id' => $route->id]);
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