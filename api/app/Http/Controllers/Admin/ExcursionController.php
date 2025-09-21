<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Excursion;
use App\Models\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage; // Added this line
use Illuminate\Validation\ValidationException;

class ExcursionController extends Controller
{
    public function index()
    {
        $excursions = Excursion::with('route.routePoints')->get()->map(function ($excursion) {
            return [
                'id' => $excursion->id,
                'start_point' => $excursion->start_point,
                'start_date' => $excursion->start_date,
                'start_time' => $excursion->start_time,
                'all_days' => $excursion->all_days,
                'all_people' => $excursion->all_people,
                'age_limit' => $excursion->age_limit,
                'route' => $excursion->route ? [
                    'id' => $excursion->route->id,
                    'description' => $excursion->route->description,
                    'route_points' => $excursion->route->routePoints->map(function ($point) {
                        return [
                            'description' => $point->description,
                            'photo_url' => $point->photo_path ? url(Storage::url($point->photo_path)) : null,
                            'order' => $point->order,
                            'day' => $point->day,
                        ];
                    }),
                ] : null,
                'created_at' => $excursion->created_at,
                'updated_at' => $excursion->updated_at,
            ];
        });

        return response()->json(['excursions' => $excursions]);
    }

    public function show($id)
    {
        try {
            $excursion = Excursion::with('route.routePoints')->findOrFail($id);
            return response()->json([
                'id' => $excursion->id,
                'start_point' => $excursion->start_point,
                'start_date' => $excursion->start_date,
                'start_time' => $excursion->start_time,
                'all_days' => $excursion->all_days,
                'all_people' => $excursion->all_people,
                'age_limit' => $excursion->age_limit,
                'route' => $excursion->route ? [
                    'id' => $excursion->route->id,
                    'description' => $excursion->route->description,
                    'route_points' => $excursion->route->routePoints->map(function ($point) {
                        return [
                            'description' => $point->description,
                            'photo_url' => $point->photo_path ? url(Storage::url($point->photo_path)) : null,
                            'order' => $point->order,
                            'day' => $point->day,
                        ];
                    }),
                ] : null,
                'created_at' => $excursion->created_at,
                'updated_at' => $excursion->updated_at,
            ]);
        } catch (\Exception $e) {
            \Log::error('Excursion not found', ['error' => $e->getMessage(), 'id' => $id]);
            return response()->json(['message' => 'Excursion not found', 'error' => $e->getMessage()], 404);
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
                'start_point' => 'required|string|max:255',
                'start_date' => 'required|date',
                'start_time' => 'required|date_format:H:i',
                'all_days' => 'required|integer|min:1',
                'all_people' => 'required|integer|min:1',
                'age_limit' => 'required|integer|min:0',
                'route_id' => 'required|exists:routes,id',
            ]);

            \Log::info('POST Request Data:', $request->all());

            $excursion = Excursion::create($validated);

            return response()->json([
                'message' => 'Excursion created',
                'excursion' => [
                    'id' => $excursion->id,
                    'start_point' => $excursion->start_point,
                    'start_date' => $excursion->start_date,
                    'start_time' => $excursion->start_time,
                    'all_days' => $excursion->all_days,
                    'all_people' => $excursion->all_people,
                    'age_limit' => $excursion->age_limit,
                    'route' => $excursion->route ? [
                        'id' => $excursion->route->id,
                        'description' => $excursion->route->description,
                        'route_points' => $excursion->route->routePoints->map(function ($point) {
                            return [
                                'description' => $point->description,
                                'photo_url' => $point->photo_path ? url(Storage::url($point->photo_path)) : null,
                                'order' => $point->order,
                                'day' => $point->day,
                            ];
                        }),
                    ] : null,
                    'created_at' => $excursion->created_at,
                    'updated_at' => $excursion->updated_at,
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
            $excursion = Excursion::findOrFail($id);

            \Log::info('PUT Request Data:', $request->all());

            $validated = $request->validate([
                'start_point' => 'sometimes|string|max:255',
                'start_date' => 'sometimes|date',
                'start_time' => 'sometimes|date_format:H:i',
                'all_days' => 'sometimes|integer|min:1',
                'all_people' => 'sometimes|integer|min:1',
                'age_limit' => 'sometimes|integer|min:0',
                'route_id' => 'sometimes|exists:routes,id',
            ]);

            $excursion->update($validated);

            return response()->json([
                'message' => 'Excursion updated',
                'excursion' => [
                    'id' => $excursion->id,
                    'start_point' => $excursion->start_point,
                    'start_date' => $excursion->start_date,
                    'start_time' => $excursion->start_time,
                    'all_days' => $excursion->all_days,
                    'all_people' => $excursion->all_people,
                    'age_limit' => $excursion->age_limit,
                    'route' => $excursion->route ? [
                        'id' => $excursion->route->id,
                        'description' => $excursion->route->description,
                        'route_points' => $excursion->route->routePoints->map(function ($point) {
                            return [
                                'description' => $point->description,
                                'photo_url' => $point->photo_path ? url(Storage::url($point->photo_path)) : null,
                                'order' => $point->order,
                                'day' => $point->day,
                            ];
                        }),
                    ] : null,
                    'created_at' => $excursion->created_at,
                    'updated_at' => $excursion->updated_at,
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
            $excursion = Excursion::findOrFail($id);
            $excursion->delete();

            return response()->json(['message' => 'Excursion deleted']);
        } catch (\Exception $e) {
            \Log::error('Deletion Failed:', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'Deletion failed', 'error' => $e->getMessage()], 500);
        }
    }
}