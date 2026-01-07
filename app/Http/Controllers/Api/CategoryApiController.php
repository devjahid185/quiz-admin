<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;

class CategoryApiController extends Controller
{
    /**
     * Serialized category list
     */
    public function index()
    {
        $categories = Category::where('status', 1)
            ->orderBy('serial', 'asc')
            ->get()
            ->map(function ($cat) {
                return [
                    'id'          => $cat->id,
                    'title'       => $cat->title,
                    'description' => $cat->description,
                    'image'       => $cat->image
                        ? asset('storage/' . $cat->image)
                        : null,
                    'serial'      => $cat->serial,
                ];
            });

        return response()->json([
            'success' => true,
            'data'    => $categories,
        ]);
    }
}
