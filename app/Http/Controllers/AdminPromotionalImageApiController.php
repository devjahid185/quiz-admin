<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PromotionalImage;
use Illuminate\Support\Facades\Storage;

class AdminPromotionalImageApiController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 50);
        $items = PromotionalImage::orderBy('position', 'asc')->orderBy('id', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $items->items(),
            'pagination' => [
                'total' => $items->total(),
                'per_page' => $items->perPage(),
                'current_page' => $items->currentPage(),
                'last_page' => $items->lastPage(),
            ]
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'nullable|string|max:255',
            'image_file' => 'nullable|image|max:5120', // Max 5MB
            'link' => 'nullable|url|max:1024',
            'is_active' => 'nullable|boolean',
            'position' => 'nullable|integer',
        ]);

        // Image Upload Logic
        if ($request->hasFile('image_file')) {
            $path = $request->file('image_file')->store('promotional_images', 'public');
            $data['image'] = $path;
        }

        // Fix boolean for FormData
        $data['is_active'] = filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN);

        $item = PromotionalImage::create($data);
        return response()->json(['success' => true, 'data' => $item], 201);
    }

    public function show(PromotionalImage $promotionalImage)
    {
        return response()->json(['success' => true, 'data' => $promotionalImage]);
    }

    public function update(Request $request, PromotionalImage $promotionalImage)
    {
        $data = $request->validate([
            'title' => 'nullable|string|max:255',
            'image_file' => 'nullable|image|max:5120',
            'link' => 'nullable|url|max:1024',
            'is_active' => 'nullable|boolean',
            'position' => 'nullable|integer',
        ]);

        if ($request->hasFile('image_file')) {
            // Delete old image
            if ($promotionalImage->image) {
                Storage::disk('public')->delete($promotionalImage->image);
            }
            $path = $request->file('image_file')->store('promotional_images', 'public');
            $data['image'] = $path;
        }

        if ($request->has('is_active')) {
            $data['is_active'] = filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN);
        }

        $promotionalImage->update($data);
        return response()->json(['success' => true, 'data' => $promotionalImage->fresh()]);
    }

    public function destroy(PromotionalImage $promotionalImage)
    {
        if ($promotionalImage->image) {
            Storage::disk('public')->delete($promotionalImage->image);
        }
        $promotionalImage->delete();
        return response()->json(['success' => true]);
    }

    public function toggleActive(PromotionalImage $promotionalImage)
    {
        $promotionalImage->is_active = !$promotionalImage->is_active;
        $promotionalImage->save();
        return response()->json(['success' => true, 'data' => $promotionalImage]);
    }
}