<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Features;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class AdminFeaturesApiController extends Controller
{
    public function index(Request $request)
    {
        $items = Features::orderBy('serial')->get();
        return response()->json(['success' => true, 'data' => $items]);
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
            $imagePath = $request->file('image')->store('features', 'public');
        }

        $item = Features::create([
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'image' => $imagePath,
            'status' => $data['status'] ?? 1,
            'serial' => $data['serial'] ?? 0,
        ]);

        return response()->json(['success' => true, 'data' => $item], 201);
    }

    public function show(Features $features)
    {
        return response()->json(['success' => true, 'data' => $features]);
    }

    public function update(Request $request, Features $features)
    {
        $data = $request->validate([
            'title' => 'required|string',
            'description' => 'nullable|string',
            'status' => 'nullable|boolean',
            'serial' => 'nullable|integer',
            'image' => 'nullable|image',
        ]);

        if ($request->hasFile('image')) {
            if ($features->image) {
                Storage::disk('public')->delete($features->image);
            }
            $features->image = $request->file('image')->store('features', 'public');
        }

        $features->update([
            'title' => $data['title'],
            'description' => $data['description'] ?? $features->description,
            'status' => $data['status'] ?? $features->status,
            'serial' => $data['serial'] ?? $features->serial,
        ]);

        return response()->json(['success' => true, 'data' => $features]);
    }

    public function destroy(Features $features)
    {
        if ($features->image) {
            Storage::disk('public')->delete($features->image);
        }
        $features->delete();
        return response()->json(['success' => true]);
    }

    public function sort(Request $request)
    {
        $request->validate(['order' => 'required|array']);

        DB::transaction(function () use ($request) {
            foreach ($request->order as $index => $id) {
                Features::where('id', $id)->update(['serial' => $index + 1]);
            }
        });

        return response()->json(['success' => true, 'message' => 'Features order updated']);
    }
}
