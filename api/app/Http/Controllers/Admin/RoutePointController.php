<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\RoutePoint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class RoutePointController extends Controller
{
    public function index()
    {
        $routePoints = RoutePoint::orderBy('order')->get();
        return response()->json(['route_points' => $routePoints]);
    }

    public function show($id)
    {
        try {
            $routePoint = RoutePoint::findOrFail($id);
            return response()->json([
                'id' => $routePoint->id,
                'description' => $routePoint->description,
                'photo_url' => $routePoint->photo_path ? Storage::url($routePoint->photo_path) : null,
                'order' => $routePoint->order,
                'route_id' => $routePoint->route_id,
            ]);
        } catch (\Exception $e) {
            \Log::error('Route point not found', ['error' => $e->getMessage(), 'id' => $id]);
            return response()->json(['message' => 'Route point not found', 'error' => $e->getMessage()], 404);
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
                'photo' => 'nullable|file|image|mimes:jpeg,png,jpg|max:2048',
                'order' => 'nullable|integer|min:0',
                'route_id' => 'nullable|exists:routes,id',
            ]);

            \Log::info('POST Request Data:', $request->all());
            \Log::info('All Files:', $request->allFiles());

            $data = [
                'description' => $validated['description'],
                'order' => $validated['order'] ?? (RoutePoint::max('order') + 1 ?? 0),
                'route_id' => $validated['route_id'] ?? null,
            ];

            $photoPath = null;
            if ($request->hasFile('photo')) {
                $file = $request->file('photo');
                if ($file->isValid()) {
                    $photoPath = $file->store('route_points', 'public');
                    \Log::info("Photo stored at: {$photoPath}");
                    $data['photo_path'] = $photoPath;
                } else {
                    \Log::error('Invalid file upload', ['error' => $file->getErrorMessage()]);
                }
            }

            $routePoint = RoutePoint::create($data);

            return response()->json([
                'message' => 'Route point created',
                'route_point' => [
                    'id' => $routePoint->id,
                    'description' => $routePoint->description,
                    'photo_url' => $photoPath ? Storage::url($photoPath) : null,
                    'order' => $routePoint->order,
                    'route_id' => $routePoint->route_id,
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
            $routePoint = RoutePoint::findOrFail($id);

            \Log::info('PUT Request Data:', $request->all());
            \Log::info('All Files:', $request->allFiles());

            $validated = $request->validate([
                'description' => 'sometimes|string|max:1000',
                'photo' => 'nullable|file|image|mimes:jpeg,png,jpg|max:2048',
                'order' => 'nullable|integer|min:0',
                'route_id' => 'nullable|exists:routes,id',
            ]);

            $data = array_filter([
                'description' => $validated['description'] ?? $routePoint->description,
                'order' => $validated['order'] ?? $routePoint->order,
                'route_id' => $validated['route_id'] ?? $routePoint->route_id,
            ]);

            if ($request->hasFile('photo')) {
                if ($routePoint->photo_path) {
                    Storage::disk('public')->delete($routePoint->photo_path);
                }
                $photoPath = $request->file('photo')->store('route_points', 'public');
                \Log::info("Photo stored at: {$photoPath}");
                $data['photo_path'] = $photoPath;
            }

            $routePoint->update($data);

            return response()->json([
                'message' => 'Route point updated',
                'route_point' => [
                    'id' => $routePoint->id,
                    'description' => $routePoint->description,
                    'photo_url' => $routePoint->photo_path ? Storage::url($routePoint->photo_path) : null,
                    'order' => $routePoint->order,
                    'route_id' => $routePoint->route_id,
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
            $routePoint = RoutePoint::findOrFail($id);

            if ($routePoint->photo_path) {
                Storage::disk('public')->delete($routePoint->photo_path);
            }

            $routePoint->delete();

            return response()->json(['message' => 'Route point deleted']);
        } catch (\Exception $e) {
            \Log::error('Deletion Failed:', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'Deletion failed', 'error' => $e->getMessage()], 500);
        }
    }
}