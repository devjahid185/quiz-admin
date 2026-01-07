<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\Controller;

class AdminProfileApiController extends Controller
{
    public function show()
    {
        $admin = Auth::guard('admin')->user();
        if (!$admin) return response()->json(null, 401);
        return response()->json(['success' => true, 'data' => $admin]);
    }

    public function updateProfile(Request $request)
    {
        $admin = Auth::guard('admin')->user();
        if (!$admin) return response()->json(null, 401);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:admins,email,' . $admin->id,
        ]);

        $admin->update([
            'name' => $request->name,
            'email' => $request->email,
        ]);

        return response()->json(['success' => true, 'data' => $admin]);
    }

    public function updatePassword(Request $request)
    {
        $admin = Auth::guard('admin')->user();
        if (!$admin) return response()->json(null, 401);

        $request->validate([
            'current_password' => 'required',
            'password' => 'required|min:6|confirmed',
        ]);

        if (!Hash::check($request->current_password, $admin->password)) {
            return response()->json(['success' => false, 'errors' => ['current_password' => 'Current password does not match!']], 422);
        }

        $admin->update(['password' => Hash::make($request->password)]);

        return response()->json(['success' => true]);
    }
}
