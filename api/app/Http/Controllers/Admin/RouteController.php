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
        $routes = Route::with('points')->get()->map(function ($route) {
            return [
                'id' => $route->id,
                'start_location' => $route->start_location,
                'start_date' => $route->start_date,
                'start_time' => $route->start_time,
                'days' => $route->days,
                'slots' => $route->slots,
                'age_restriction' => $route->age_restriction,
                'cost' => $route->cost,
                'created_at' => $route->created_at,
                'points' => $route->points->map(function ($point) {
                    return [
                        'id' => $point->id,
                        'description' => $point->description,
                        'photo_url' => $point->photo_path ? Storage::url($point->photo_path) : null,
                        'order' => $point->order,
                    ];
                }),
            ];
        });

        return response()->json(['routes' => $routes]);
    }

    public function show($id)
    {
        try {
            $route = Route::with('points')->findOrFail($id);
            return response()->json([
                'id' => $route->id,
                'start_location' => $route->start_location,
                'start_date' => $route->start_date,
                'start_time' => $route->start_time,
                'days' => $route->days,
                'slots' => $route->slots,
                'age_restriction' => $route->age_restriction,
                'cost' => $route->cost,
                'created_at' => $route->created_at,
                'points' => $route->points->map(function ($point) {
                    return [
                        'id' => $point->id,
                        'description' => $point->description,
                        'photo_url' => $point->photo_path ? Storage::url($point->photo_path) : null,
                        'order' => $point->order,
                    ];
                }),
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Route not found', 'error' => $e->getMessage()], 404);
        }
    }

    public function store(Request $request)
    {
        if (!Auth::user()->is_admin) {
            return response()->json(['message' => 'Unauthorized: Admin access required'], 403);
        }

        try {
            $validated = $request->validate([
                'start_location' => 'required|string|max:255',
                'start_date' => 'required|date',
                'start_time' => 'required|date_format:H:i',
                'days' => 'required|integer|min:1',
                'slots' => 'sometimes|integer|min:1',
                'age_restriction' => 'required|integer|min:0',
                'cost' => 'required|numeric|min:0',
                'points' => 'required|array|min:1',
                'points.*.description' => 'nullable|string|max:255',
                'points.*.photo' => 'nullable|file|image|mimes:png,jpg|max:2048',
                'points.*.order' => 'required|integer|min:0',
            ]);

            $route = Route::create([
                'user_id' => Auth::id(),
                'start_location' => $request->start_location,
                'start_date' => $request->start_date,
                'start_time' => $request->start_time,
                'days' => $request->days,
                'slots' => $request->slots ?? 10,
                'age_restriction' => $request->age_restriction,
                'cost' => $request->cost,
            ]);

            foreach ($request->points as $pointData) {
                $photoPath = null;
                if (isset($pointData['photo'])) {
                    $photoPath = $pointData['photo']->store('route_points', 'public');
                }

                RoutePoint::create([
                    'route_id' => $route->id,
                    'description' => $pointData['description'] ?? null,
                    'photo_path' => $photoPath,
                    'order' => $pointData['order'],
                ]);
            }

            return response()->json([
                'message' => 'Route created',
                'route' => $route->load('points'),
            ], 201);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Creation failed', 'error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        if (!Auth::user()->is_admin) {
            return response()->json(['message' => 'Unauthorized: Admin access required'], 403);
        }

        try {
            $route = Route::findOrFail($id);

            // Логируем входящий запрос для отладки
            \Log::info('PUT Request Data:', $request->all());
            \Log::info('All Files:', $request->allFiles());

            $validated = $request->validate([
                'start_location' => 'sometimes|string|max:255',
                'start_date' => 'sometimes|date',
                'start_time' => 'sometimes|date_format:H:i',
                'days' => 'sometimes|integer|min:1',
                'slots' => 'sometimes|integer|min:1',
                'age_restriction' => 'sometimes|integer|min:0',
                'cost' => 'sometimes|numeric|min:0',
                'points' => 'sometimes|array',
                'points.*.description' => 'nullable|string|max:255',
                'points.*.photo' => 'nullable|file|image|mimes:png,jpg|max:2048',
                'points.*.order' => 'sometimes|integer|min:0',
            ]);

            \Log::info('Validated Data:', $validated);

            $updates = array_diff_key($validated, array_flip(['points']));
            if (!empty($updates)) {
                $bookedSlots = $route->bookings()->where('canceled', false)->sum('slots');
                if (isset($updates['slots']) && $updates['slots'] < $bookedSlots) {
                    return response()->json(['message' => 'New slots count cannot be less than booked slots'], 400);
                }
                \Log::info('Updates Applied:', $updates);
                $route->update($updates);
            } else {
                \Log::warning('No updates to apply');
            }

            if ($request->has('points')) {
                \Log::info('Processing points data:', $request->input('points'));
                $existingPoints = $route->points->keyBy('order');
                foreach ($route->points as $point) {
                    if ($point->photo_path) {
                        Storage::disk('public')->delete($point->photo_path);
                    }
                }
                $route->points()->delete();

                $pointsData = $request->input('points', []);
                foreach ($pointsData as $index => $pointData) {
                    $photoPath = null;
                    $photoFiles = $request->allFiles();
                    $photoKey = "points.{$index}.photo";
                    if (isset($photoFiles[$photoKey]) && $photoFiles[$photoKey]->isValid()) {
                        $photoPath = $photoFiles[$photoKey]->store('route_points', 'public');
                        \Log::info("Photo stored at: {$photoPath}");
                    } elseif (isset($pointData['photo']) && is_string($pointData['photo'])) {
                        $photoPath = $pointData['photo'];
                    } elseif (isset($existingPoints[$pointData['order']])) {
                        $photoPath = $existingPoints[$pointData['order']]->photo_path;
                    }

                    RoutePoint::create([
                        'route_id' => $route->id,
                        'description' => $pointData['description'] ?? null,
                        'photo_path' => $photoPath,
                        'order' => $pointData['order'] ?? 0,
                    ]);
                }
            } else {
                \Log::warning('No points provided for update');
            }

            return response()->json([
                'message' => 'Route updated',
                'route' => $route->load('points'),
            ]);
        } catch (ValidationException $e) {
            \Log::error('Validation Error:', $e->errors());
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            \Log::error('Update Failed:', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'Update failed', 'error' => $e->getMessage()], 500);
        }
    }

    public function patch(Request $request, $id)
    {
        if (!Auth::user()->is_admin) {
            return response()->json(['message' => 'Unauthorized: Admin access required'], 403);
        }

        try {
            $route = Route::findOrFail($id);

            // Логируем входящий запрос для отладки
            \Log::info('PATCH Request Data:', $request->all());
            \Log::info('All Files:', $request->allFiles());

            $validated = $request->validate([
                'start_location' => 'sometimes|string|max:255',
                'start_date' => 'sometimes|date',
                'start_time' => 'sometimes|date_format:H:i',
                'days' => 'sometimes|integer|min:1',
                'slots' => 'sometimes|integer|min:1',
                'age_restriction' => 'sometimes|integer|min:0',
                'cost' => 'sometimes|numeric|min:0',
                'points' => 'sometimes|array',
                'points.*.description' => 'nullable|string|max:255',
                'points.*.photo' => 'nullable|file|image|mimes:png,jpg|max:2048',
                'points.*.order' => 'sometimes|integer|min:0',
            ]);

            // Логируем валидированные данные
            \Log::info('Validated Data:', $validated);

            // Обновляем только переданные поля маршрута
            $updates = array_diff_key($validated, array_flip(['points']));
            if (!empty($updates)) {
                $bookedSlots = $route->bookings()->where('canceled', false)->sum('slots');
                if (isset($updates['slots']) && $updates['slots'] < $bookedSlots) {
                    return response()->json(['message' => 'New slots count cannot be less than booked slots'], 400);
                }
                \Log::info('Route Updates Applied:', $updates);
                $route->update($updates);
            } else {
                \Log::warning('No route updates to apply');
            }

            // Обработка точек маршрута
            if ($request->has('points')) {
                \Log::info('Processing points data:', $request->input('points'));
                $existingPoints = $route->points->keyBy('order');

                $pointsData = $request->input('points', []);
                foreach ($pointsData as $index => $pointData) {
                    $photoPath = null;
                    $photoFile = $request->file("points.{$index}.photo");
                    if ($photoFile && $photoFile->isValid()) {
                        $photoPath = $photoFile->store('route_points', 'public');
                        \Log::info("Photo stored at: {$photoPath}");
                    } elseif (isset($pointData['photo']) && is_string($pointData['photo'])) {
                        $photoPath = $pointData['photo'];
                    } elseif (isset($existingPoints[$pointData['order']])) {
                        $photoPath = $existingPoints[$pointData['order']]->photo_path;
                    }

                    $existingPoint = $existingPoints->get($pointData['order']);
                    if ($existingPoint) {
                        $existingPoint->update([
                            'description' => $pointData['description'] ?? $existingPoint->description,
                            'photo_path' => $photoPath ?? $existingPoint->photo_path,
                            'order' => $pointData['order'] ?? $existingPoint->order,
                        ]);
                    } else {
                        RoutePoint::create([
                            'route_id' => $route->id,
                            'description' => $pointData['description'] ?? null,
                            'photo_path' => $photoPath,
                            'order' => $pointData['order'] ?? 0,
                        ]);
                    }
                }
            } else {
                \Log::warning('No points provided for update');
            }

            return response()->json([
                'message' => 'Route patched',
                'route' => $route->load('points'),
            ]);
        } catch (ValidationException $e) {
            \Log::error('Validation Error:', $e->errors());
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            \Log::error('Patch Failed:', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'Patch failed', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        if (!Auth::user()->is_admin) {
            return response()->json(['message' => 'Unauthorized: Admin access required'], 403);
        }

        try {
            $route = Route::findOrFail($id);

            foreach ($route->points as $point) {
                if ($point->photo_path) {
                    Storage::disk('public')->delete($point->photo_path);
                }
            }

            $route->delete();

            return response()->json(['message' => 'Route deleted']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Deletion failed', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Поиск маршрутов по ключевому слову
     */
    public function search(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $title = strtolower($validated['title']); // Приводим к нижнему регистру для нечувствительности
        $routes = Route::with('points')
            ->whereRaw('LOWER(start_location) LIKE ?', ["%{$title}%"])
            ->get()
            ->map(function ($route) {
                return [
                    'id' => $route->id,
                    'start_location' => $route->start_location,
                    'start_date' => $route->start_date,
                    'start_time' => $route->start_time,
                    'days' => $route->days,
                    'slots' => $route->slots,
                    'age_restriction' => $route->age_restriction,
                    'cost' => $route->cost,
                    'created_at' => $route->created_at,
                    'points' => $route->points->map(function ($point) {
                        return [
                            'id' => $point->id,
                            'description' => $point->description,
                            'photo_url' => $point->photo_path ? Storage::url($point->photo_path) : null,
                            'order' => $point->order,
                        ];
                    }),
                ];
            });

        return response()->json(['routes' => $routes]);
    }
}
