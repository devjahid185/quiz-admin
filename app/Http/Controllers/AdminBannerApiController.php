<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Banner;
use Illuminate\Support\Facades\Storage;

class AdminBannerApiController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 20);
        $banners = Banner::orderBy('position', 'asc')->paginate($perPage);
        return response()->json([
            'success' => true,
            'data' => $banners->items(),
            'pagination' => [
                'total' => $banners->total(),
                'per_page' => $banners->perPage(),
                'current_page' => $banners->currentPage(),
                'last_page' => $banners->lastPage(),
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
            $path = $request->file('image_file')->store('banners', 'public');
            $data['image'] = $path;
        }

        // boolean fix for formData
        $data['is_active'] = filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN);

        $banner = Banner::create($data);
        return response()->json(['success' => true, 'data' => $banner], 201);
    }

    public function show(Banner $banner)
    {
        return response()->json(['success' => true, 'data' => $banner]);
    }

    public function update(Request $request, Banner $banner)
    {
        $data = $request->validate([
            'title' => 'nullable|string|max:255',
            'image_file' => 'nullable|image|max:5120',
            'link' => 'nullable|url|max:1024',
            'is_active' => 'nullable|boolean',
            'position' => 'nullable|integer',
        ]);

        if ($request->hasFile('image_file')) {
            // Delete old image if exists
            if ($banner->image) {
                Storage::disk('public')->delete($banner->image);
            }
            $path = $request->file('image_file')->store('banners', 'public');
            $data['image'] = $path;
        }

        if ($request->has('is_active')) {
            $data['is_active'] = filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN);
        }

        $banner->update($data);
        return response()->json(['success' => true, 'data' => $banner]);
    }

    public function destroy(Banner $banner)
    {
        if ($banner->image) {
            Storage::disk('public')->delete($banner->image);
        }
        $banner->delete();
        return response()->json(['success' => true]);
    }

    public function toggleActive(Banner $banner)
    {
        $banner->is_active = !$banner->is_active;
        $banner->save();
        return response()->json(['success' => true, 'data' => $banner]);
    }
}