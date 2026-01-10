<?php

namespace App\Http\Controllers;

// App\Http\Controllers\SubCategoryController.php
use App\Models\Category;
use App\Models\SubCategory;
use Illuminate\Http\Request;

class SubCategoryController extends Controller
{
    public function index()
    {
        $subCategories = SubCategory::with('category')->orderBy('serial')->get();
        return view('sub-category.index', compact('subCategories'));
    }

    public function create()
    {
        $categories = Category::where('status',1)->get();
        return view('sub-category.create', compact('categories'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'category_id' => 'required',
            'title' => 'required',
        ]);

        SubCategory::create($request->all());

        return redirect()->route('sub-category.index')->with('success','Sub Category Added');
    }

    public function edit($id)
    {
        $subCategory = SubCategory::findOrFail($id);
        $categories = Category::all();
        return view('sub-category.edit', compact('subCategory','categories'));
    }

    public function update(Request $request, $id)
    {
        $subCategory = SubCategory::findOrFail($id);
        $subCategory->update($request->all());

        return redirect()->route('sub-category.index')->with('success','Updated');
    }

    public function destroy($id)
    {
        SubCategory::findOrFail($id)->delete();
        return back()->with('success','Deleted');
    }
}
