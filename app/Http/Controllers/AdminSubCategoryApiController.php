<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SubCategory;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class AdminSubCategoryApiController extends Controller
{
    public function index(Request $request)
    {
        $subs = SubCategory::with('category')->orderBy('serial')->get();
        return response()->json(['success' => true, 'data' => $subs]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'title' => 'required|string',
            'description' => 'nullable|string',
            'status' => 'nullable|boolean',
            'serial' => 'nullable|integer',
            'image' => 'nullable|image',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('subcategories', 'public');
        }

        $sub = SubCategory::create([
            'category_id' => $data['category_id'],
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'image' => $imagePath,
            'status' => $data['status'] ?? 1,
            'serial' => $data['serial'] ?? 0,
        ]);

        // return with parent category loaded
        $sub->load('category');
        return response()->json(['success' => true, 'data' => $sub], 201);
    }

    public function show(SubCategory $subCategory)
    {
        $subCategory->load('category');
        return response()->json(['success' => true, 'data' => $subCategory]);
    }

    public function update(Request $request, SubCategory $subCategory)
    {
        $data = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'title' => 'required|string',
            'description' => 'nullable|string',
            'status' => 'nullable|boolean',
            'serial' => 'nullable|integer',
            'image' => 'nullable|image',
        ]);

        if ($request->hasFile('image')) {
            if ($subCategory->image) {
                Storage::disk('public')->delete($subCategory->image);
            }
            $subCategory->image = $request->file('image')->store('subcategories', 'public');
        }

        $subCategory->update([
            'category_id' => $data['category_id'],
            'title' => $data['title'],
            'description' => $data['description'] ?? $subCategory->description,
            'status' => $data['status'] ?? $subCategory->status,
            'serial' => $data['serial'] ?? $subCategory->serial,
        ]);

        $subCategory->load('category');
        return response()->json(['success' => true, 'data' => $subCategory]);
    }

    public function destroy(SubCategory $subCategory)
    {
        if ($subCategory->image) {
            Storage::disk('public')->delete($subCategory->image);
        }
        $subCategory->delete();
        return response()->json(['success' => true]);
    }

    public function sort(Request $request)
    {
        $request->validate(['order' => 'required|array']);

        DB::transaction(function () use ($request) {
            foreach ($request->order as $index => $id) {
                SubCategory::where('id', $id)->update(['serial' => $index + 1]);
            }
        });

        return response()->json(['success' => true, 'message' => 'SubCategory order updated']);
    }
}
