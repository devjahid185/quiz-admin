<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminApiController extends Controller
{
    public function login(Request $request)
    {
        $cred = $request->only('email', 'password');

        if (Auth::guard('admin')->attempt($cred, $request->filled('remember'))) {
            $request->session()->regenerate();
            
            // Get session cookie name
            $sessionName = config('session.cookie');
            
            // Return response with explicit cookie setting (Laravel handles this, but explicit helps)
            return response()->json([
                'success' => true,
                'admin' => Auth::guard('admin')->user()
            ])->header('Access-Control-Allow-Credentials', 'true');
        }

        return response()->json(['success' => false], 401);
    }

    public function check()
    {
        if (Auth::guard('admin')->check()) {
            return response()->json([
                'authenticated' => true,
                'admin' => Auth::guard('admin')->user()
            ]);
        }
        return response()->json(['authenticated' => false], 401);
    }

    public function logout(Request $request)
    {
        Auth::guard('admin')->logout();
        $request->session()->invalidate();
        return response()->json(['success' => true]);
    }
}

