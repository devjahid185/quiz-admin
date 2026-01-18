<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Models\Banner;
use App\Http\Controllers\Controller;

class BannerApiController extends Controller
{
    // Public index for active banners
    public function index(Request $request)
    {
        $banners = Banner::where('is_active', true)->orderBy('position', 'asc')->get();
        $result = $banners->map(function($b){
            return [
                'id' => $b->id,
                'title' => $b->title,
                'image' => $b->image ? url('/storage/' . $b->image) : null,
                'link' => $b->link,
                'position' => $b->position,
            ];
        });

        return response()->json(['success' => true, 'data' => $result]);
    }
}
