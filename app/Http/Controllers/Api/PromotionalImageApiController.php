<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Models\PromotionalImage;
use App\Http\Controllers\Controller;

class PromotionalImageApiController extends Controller
{
    // Public index for active promotional images
    public function index(Request $request)
    {
        $items = PromotionalImage::where('is_active', true)->orderBy('position', 'asc')->get();
        $result = $items->map(function($i){
            return [
                'id' => $i->id,
                'title' => $i->title,
                'image' => $i->image ? url('/storage/' . $i->image) : null,
                'link' => $i->link,
                'is_active' => $i->is_active,
                'position' => $i->position,
            ];
        });

        return response()->json(['success' => true, 'data' => $result]);
    }
}
