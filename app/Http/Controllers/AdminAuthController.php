<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Admin;

class AdminAuthController extends Controller
{
    public function loginForm() {
        return view('admin.login');
    }

    public function login(Request $request) {
        $cred = $request->only('email', 'password');

        if (Auth::guard('admin')->attempt($cred)) {
            return redirect()->route('admin.dashboard');
        }

        return back()->with('error', 'Invalid login');
    }

    public function dashboard() {
        return view('admin.dashboard');
    }

    public function logout() {
        Auth::guard('admin')->logout();
        return redirect()->route('admin.login');
    }
}

