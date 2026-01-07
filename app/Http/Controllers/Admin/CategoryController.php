<?php

namespace App\Http\Controllers\Admin;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::orderBy('serial')->get();
        return view('admin.categories.index', compact('categories'));
    }

    public function create()
    {
        return view('admin.categories.create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required',
            'image' => 'nullable|image',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('categories', 'public');
        }

        Category::create([
            'title' => $request->title,
            'description' => $request->description,
            'image' => $imagePath,
            'status' => $request->status ?? 1,
            'serial' => $request->serial ?? 0,
        ]);

        return redirect()->route('admin.categories.index')->with('success', 'Category added');
    }

    public function edit(Category $category)
    {
        return view('admin.categories.edit', compact('category'));
    }

    public function update(Request $request, Category $category)
    {
        $request->validate([
            'title' => 'required',
            'image' => 'nullable|image',
        ]);

        if ($request->hasFile('image')) {
            if ($category->image) {
                Storage::disk('public')->delete($category->image);
            }
            $category->image = $request->file('image')->store('categories', 'public');
        }

        $category->update([
            'title' => $request->title,
            'description' => $request->description,
            'status' => $request->status,
            'serial' => $request->serial,
        ]);

        return redirect()->route('admin.categories.index')->with('success', 'Category updated');
    }

    public function destroy(Category $category)
    {
        if ($category->image) {
            Storage::disk('public')->delete($category->image);
        }

        $category->delete();
        return back()->with('success', 'Category deleted');
    }

    public function updateSerial(Request $request, $id)
    {
        $request->validate([
            'serial' => 'required|integer|min:0'
        ]);

        Category::where('id', $id)->update([
            'serial' => $request->serial
        ]);

        return back()->with('success', 'Category order updated');
    }

    public function sort(Request $request)
    {
        $request->validate([
            'order' => 'required|array'
        ]);

        DB::transaction(function () use ($request) {
            foreach ($request->order as $index => $id) {
                \App\Models\Category::where('id', $id)
                    ->update(['serial' => $index + 1]);
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Category order updated'
        ]);
    }
}
