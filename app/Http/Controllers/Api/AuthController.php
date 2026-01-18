<?php

namespace App\Http\Controllers\Api;

use Carbon\Carbon;
use App\Models\User;
use App\Models\CoinHistory;
use App\Models\DeviceToken;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

class AuthController extends Controller
{
    // ================= REGISTER =================
    public function register(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users',
            'password' => 'required|min:6|confirmed',
        ]);

        // Create user as BLOCKED
        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'blocked'  => 1,
        ]);

        // Generate OTP
        $otp = rand(100000, 999999);

        $user->otp = $otp;
        $user->otp_expires_at = Carbon::now()->addMinutes(10);
        $user->save();

        // Send OTP Email
        Mail::raw("Your account verification OTP is: $otp", function ($m) use ($user) {
            $m->to($user->email)
                ->subject('Verify Your Account');
        });

        return response()->json([
            'success' => true,
            'message' => 'Account created. OTP sent to email.',
            'user_id' => $user->id,
        ]);
    }

    // ================= VERIFY REGISTER OTP =================
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp'   => 'required|digits:6',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        if (
            $user->otp !== $request->otp ||
            Carbon::now()->gt($user->otp_expires_at)
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired OTP',
            ], 400);
        }

        // Activate account
        $user->blocked = 0;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Account verified successfully',
        ]);
    }

    // ================= LOGIN =================
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials',
            ], 401);
        }

        $user = Auth::user();

        if ($user->blocked) {
            Auth::logout();
            return response()->json([
                'success' => false,
                'message' => 'Account not verified or blocked',
            ], 403);
        }

        // Update online status
        $user->is_online = true;
        $user->last_seen_at = now();
        $user->save();

        return response()->json([
            'success' => true,
            'user'    => $user,
        ]);
    }

    // ================= FORGOT PASSWORD =================
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $user = User::where('email', $request->email)->first();

        $otp = rand(100000, 999999);

        $user->otp = $otp;
        $user->otp_expires_at = Carbon::now()->addMinutes(10);
        $user->save();

        Mail::raw("Password reset OTP: $otp", function ($m) use ($user) {
            $m->to($user->email)
                ->subject('Reset Password OTP');
        });

        return response()->json([
            'success' => true,
            'message' => 'OTP sent to email',
        ]);
    }

    // ================= RESET PASSWORD =================
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'otp'      => 'required|digits:6',
            'password' => 'required|min:6|confirmed',
        ]);

        $user = User::where('email', $request->email)->first();

        if (
            !$user ||
            $user->otp !== $request->otp ||
            Carbon::now()->gt($user->otp_expires_at)
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired OTP',
            ], 400);
        }

        $user->password = Hash::make($request->password);
        $user->otp = null;
        $user->otp_expires_at = null;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Password reset successful',
        ]);
    }

    // ================= LOGOUT =================
    public function logout(Request $request)
    {
        $user = $request->user();

        // Update online status
        if ($user) {
            $user->is_online = false;
            $user->last_seen_at = now();
            $user->save();
        }

        Auth::logout();
        return response()->json(['success' => true]);
    }

    // ================= CURRENT USER =================
    public function user(Request $request)
    {
        $user = $request->user();

        // রেসপন্সে ইমেজের ফুল URL পাঠানোর জন্য
        $userData = $user->toArray();
        $userData['profile_image_url'] = $user->profile_image ? asset('storage/' . $user->profile_image) : null;

        return response()->json([
            'success' => true,
            'user'    => $userData,
        ]);
    }

    // ================= FETCH BALANCE BY EMAIL =================
    public function getBalanceByEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);
        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }
        return response()->json([
            'success' => true,
            'main_balance' => $user->main_balance,
            'coin_balance' => $user->coin_balance,
        ]);
    }

    // ================= UPDATE COIN BALANCE =================
    public function updateCoinBalance(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'coins' => 'required|integer|min:1', // অন্তত ১ কয়েন হতে হবে
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        // Balance before transaction
        $balanceBefore = $user->coin_balance;

        // কয়েন যোগ করা
        $user->coin_balance += $request->coins;
        $user->save();

        // Coin History Save
        \App\Models\CoinHistory::create([
            'user_id' => $user->id,
            'coins' => $request->coins,
            'type' => 'earned',
            'source' => 'admin',
            'description' => 'Coins added by admin',
            'balance_before' => $balanceBefore,
            'balance_after' => $user->coin_balance,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Coins updated successfully',
            'coin_balance' => $user->coin_balance, // আপডেটেড ব্যালেন্স রিটার্ন করা
        ]);
    }

    // ================= CHANGE PASSWORD =================
    public function changePassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'current_password' => 'required',
            'new_password' => 'required|min:6|confirmed', // new_password_confirmation ফিল্ড থাকতে হবে
        ]);

        // ১. ইউজার খোঁজা
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        // ২. বর্তমান পাসওয়ার্ড চেক করা
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password does not match',
            ], 400);
        }

        // ৩. নতুন পাসওয়ার্ড সেভ করা
        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully',
        ]);
    }

    // ================= UPDATE PROFILE (WITHOUT TOKEN) =================
    public function updateProfile(Request $request)
    {
        // ১. ইমেইল ভ্যালিডেশন অবশ্যই লাগবে ইউজার চেনার জন্য
        $request->validate([
            'email' => 'required|email',
            'name'  => 'nullable|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // ২. ইমেইল দিয়ে ইউজার খোঁজা
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        // ৩. নাম আপডেট
        if ($request->has('name') && $request->name != null) {
            $user->name = $request->name;
        }

        // ৪. ইমেজ আপলোড লজিক
        if ($request->hasFile('image')) {
            // আগের ইমেজ ডিলিট করা
            if ($user->profile_image && \Illuminate\Support\Facades\Storage::disk('public')->exists($user->profile_image)) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($user->profile_image);
            }

            // নতুন ইমেজ সেভ করা
            $imageName = time() . '_' . uniqid() . '.' . $request->file('image')->getClientOriginalExtension();
            $path = $request->file('image')->storeAs('profile_images', $imageName, 'public');
            $user->profile_image = $path;
        }

        $user->save();

        // রেসপন্স রেডি করা
        $userData = $user->toArray();
        $userData['profile_image_url'] = $user->profile_image ? asset('storage/' . $user->profile_image) : null;

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'user'    => $userData,
        ]);
    }

    // ================= UPDATE ONLINE STATUS =================
    public function updateOnlineStatus(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'is_online' => 'required|boolean'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        $user->is_online = $request->is_online;
        $user->last_seen_at = now();
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Online status updated',
            'is_online' => $user->is_online,
            'last_seen_at' => $user->last_seen_at,
        ]);
    }

    public function updateFcmToken(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User not found']);
        }

        // টোকেনটি সেভ বা আপডেট করা হচ্ছে
        // updateOrCreate চেক করবে এই টোকেনটি ইতিমধ্যে আছে কিনা
        DeviceToken::updateOrCreate(
            ['token' => $request->token], // চেক করবে টোকেন দিয়ে
            ['user_id' => $user->id]      // আপডেট করবে ইউজার আইডি (যদি ইউজার চেঞ্জ হয়)
        );

        return response()->json([
            'success' => true,
            'message' => 'Token updated successfully'
        ]);
    }
}
