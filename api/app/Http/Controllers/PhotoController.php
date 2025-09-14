<?php

namespace App\Http\Controllers;

use App\Models\Photo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class PhotoController extends Controller
{
    public function upload(Request $request)
    {
        try {
            $validated = $request->validate([
                'photo' => 'required|file|image|mimes:png,jpg|max:2048', // PNG/JPG, макс 2MB
                'description' => 'nullable|string|max:255', // Описание опционально
            ]);

            $user = Auth::user();

            // Сохраняем файл в storage/app/public/photos
            $path = $request->file('photo')->store('photos', 'public');

            // Создаём запись в БД
            $photo = Photo::create([
                'user_id' => $user->id,
                'description' => $request->description,
                'path' => $path,
            ]);

            // Генерируем публичный URL для фото
            $url = Storage::url($path);

            return response()->json([
                'message' => 'Photo uploaded',
                'photo_id' => $photo->id,
                'url' => $url,
                'description' => $photo->description,
            ], 201);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Upload failed', 'error' => $e->getMessage()], 500);
        }
    }

    public function getPhotos(Request $request)
    {
        // Получаем все фото из БД
        $photos = Photo::all()->map(function ($photo) {
            return [
                'id' => $photo->id,
                'description' => $photo->description,
                'url' => Storage::url($photo->path), // Публичный URL
                'created_at' => $photo->created_at,
                'user_id' => $photo->user_id, // Опционально: ID пользователя
            ];
        });

        return response()->json(['photos' => $photos]);
    }

    public function getPhoto($id)
    {
        try {
            $photo = Photo::findOrFail($id);

            return response()->json([
                'id' => $photo->id,
                'description' => $photo->description,
                'url' => Storage::url($photo->path),
                'created_at' => $photo->created_at,
                'user_id' => $photo->user_id, // Опционально: ID пользователя
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Photo not found', 'error' => $e->getMessage()], 404);
        }
    }
}