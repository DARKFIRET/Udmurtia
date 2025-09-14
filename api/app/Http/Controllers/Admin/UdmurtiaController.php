<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Udmurtia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class UdmurtiaController extends Controller
{
    /**
     * Получить информацию об Удмуртии
     */
    public function get()
    {
        $udmurtia = Udmurtia::first(); // Берем первый (или единственный) запис
        if (!$udmurtia) {
            return response()->json([
                'title' => null,
                'description' => null
            ]);
        }
        return response()->json($udmurtia);
    }

    /**
     * Создать или полностью перезаписать информацию об Удмуртии
     */
    public function store(Request $request)
    {
        if (!Auth::user()->is_admin) {
            return response()->json(['message' => 'Unauthorized: Admin access required'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
        ]);

        $udmurtia = Udmurtia::first();
        if ($udmurtia) {
            $udmurtia->update($validated);
        } else {
            $udmurtia = Udmurtia::create($validated);
        }

        Log::info('Udmurtia stored or updated:', $validated);
        return response()->json($udmurtia, $udmurtia->wasRecentlyCreated ? 201 : 200);
    }

    /**
     * Частично обновить информацию об Удмуртии
     */
    public function patch(Request $request)
    {
        if (!Auth::user()->is_admin) {
            return response()->json(['message' => 'Unauthorized: Admin access required'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
        ]);

        $udmurtia = Udmurtia::first();
        if (!$udmurtia) {
            return response()->json(['message' => 'No data to update'], 404);
        }

        $udmurtia->update($validated);
        Log::info('Udmurtia patched:', $validated);
        return response()->json($udmurtia);
    }
}
