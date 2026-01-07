<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Category;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class AdminCategoryApiController extends Controller
{
    public function index(Request $request)
    {
        $categories = Category::orderBy('serial')->get();
        return response()->json(['success' => true, 'data' => $categories]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string',
            'description' => 'nullable|string',
            'status' => 'nullable|boolean',
            'serial' => 'nullable|integer',
            'image' => 'nullable|image',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('categories', 'public');
        }

        $cat = Category::create([
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'image' => $imagePath,
            'status' => $data['status'] ?? 1,
            'serial' => $data['serial'] ?? 0,
        ]);

        return response()->json(['success' => true, 'data' => $cat], 201);
    }

    public function show(Category $category)
    {
        return response()->json(['success' => true, 'data' => $category]);
    }

    public function update(Request $request, Category $category)
    {
        $data = $request->validate([
            'title' => 'required|string',
            'description' => 'nullable|string',
            'status' => 'nullable|boolean',
            'serial' => 'nullable|integer',
            'image' => 'nullable|image',
        ]);

        if ($request->hasFile('image')) {
            if ($category->image) {
                Storage::disk('public')->delete($category->image);
            }
            $category->image = $request->file('image')->store('categories', 'public');
        }

        $category->update([
            'title' => $data['title'],
            'description' => $data['description'] ?? $category->description,
            'status' => $data['status'] ?? $category->status,
            'serial' => $data['serial'] ?? $category->serial,
        ]);

        return response()->json(['success' => true, 'data' => $category]);
    }

    public function destroy(Category $category)
    {
        if ($category->image) {
            Storage::disk('public')->delete($category->image);
        }
        $category->delete();
        return response()->json(['success' => true]);
    }

    public function sort(Request $request)
    {
        $request->validate(['order' => 'required|array']);

        DB::transaction(function () use ($request) {
            foreach ($request->order as $index => $id) {
                Category::where('id', $id)->update(['serial' => $index + 1]);
            }
        });

        return response()->json(['success' => true, 'message' => 'Category order updated']);
    }
}
