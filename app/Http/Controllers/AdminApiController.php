<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminApiController extends Controller
{
    public function login(Request $request)
    {
        $cred = $request->only('email', 'password');

        if (Auth::guard('admin')->attempt($cred)) {
            $request->session()->regenerate();

            return response()->json([
                'success' => true,
                'admin' => Auth::guard('admin')->user()
            ]);
        }

        return response()->json(['success' => false], 401);
    }

    public function check()
    {
        if (Auth::guard('admin')->check()) {
            return response()->json(Auth::guard('admin')->user());
        }
        return response()->json(null, 401);
    }

    public function logout(Request $request)
    {
        Auth::guard('admin')->logout();
        $request->session()->invalidate();
        return response()->json(['success' => true]);
    }
}

