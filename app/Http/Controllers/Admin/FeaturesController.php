<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Models\Features;
use Illuminate\Support\Facades\Storage;

class FeaturesController extends Controller
{
    public function index()
    {
        $features = Features::orderBy('serial')->get();
        return view('admin.features.index', compact('features'));
    }

    public function create()
    {
        return view('admin.features.create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required',
            'image' => 'nullable|image',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('features', 'public');
        }

        Features::create([
            'title' => $request->title,
            'description' => $request->description,
            'image' => $imagePath,
            'status' => $request->status ?? 1,
            'serial' => $request->serial ?? 0,
        ]);

        return redirect()->route('admin.features.index')->with('success', 'Features added');
    }

    public function edit(Features $features)
    {
        return view('admin.features.edit', compact('features'));
    }

    public function update(Request $request, Features $features)
    {
        $request->validate([
            'title' => 'required',
            'image' => 'nullable|image',
        ]);

        if ($request->hasFile('image')) {
            if ($features->image) {
                Storage::disk('public')->delete($features->image);
            }
            $features->image = $request->file('image')->store('features', 'public');
        }

        $features->update([
            'title' => $request->title,
            'description' => $request->description,
            'status' => $request->status,
            'serial' => $request->serial,
        ]);

        return redirect()->route('admin.features.index')->with('success', 'features updated');
    }

    public function destroy(Features $features)
    {
        if ($features->image) {
            Storage::disk('public')->delete($features->image);
        }

        $features->delete();
        return back()->with('success', 'features deleted');
    }

    public function updateSerial(Request $request, $id)
    {
        $request->validate([
            'serial' => 'required|integer|min:0'
        ]);

        Features::where('id', $id)->update([
            'serial' => $request->serial
        ]);

        return back()->with('success', 'Features order updated');
    }

    public function sort(Request $request)
    {
        $request->validate([
            'order' => 'required|array'
        ]);

        DB::transaction(function () use ($request) {
            foreach ($request->order as $index => $id) {
                Features::where('id', $id)
                    ->update(['serial' => $index + 1]);
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Features order updated'
        ]);
    }
}
