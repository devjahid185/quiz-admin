<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\BalanceHistory;
use App\Models\CoinHistory;
use Illuminate\Support\Facades\Hash;

class AdminUserApiController extends Controller
{
    // Index method with pagination and search
    public function index(Request $request)
    {
        $query = User::orderBy('id', 'desc');

        // Search Logic
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('email', 'like', "%$search%");
            });
        }

        // Pagination (Default 10)
        $perPage = $request->input('per_page', 10);
        $users = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $users->items(), // শুধু ইউজার ডেটা
            'pagination' => [
                'total' => $users->total(),
                'per_page' => $users->perPage(),
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'from' => $users->firstItem(),
                'to' => $users->lastItem()
            ]
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
            'main_balance' => 'nullable|numeric',
            'coin_balance' => 'nullable|integer',
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'main_balance' => $data['main_balance'] ?? 0,
            'coin_balance' => $data['coin_balance'] ?? 0,
        ]);

        return response()->json(['success' => true, 'data' => $user], 201);
    }

    public function show(User $user)
    {
        return response()->json(['success' => true, 'data' => $user]);
    }

    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'password' => 'nullable|min:6',
            'main_balance' => 'nullable|numeric',
            'coin_balance' => 'nullable|integer',
        ]);

        $user->name = $data['name'];
        $user->email = $data['email'];
        if (!empty($data['password'])) {
            $user->password = Hash::make($data['password']);
        }
        $user->main_balance = $data['main_balance'] ?? $user->main_balance;
        $user->coin_balance = $data['coin_balance'] ?? $user->coin_balance;
        $user->save();

        return response()->json(['success' => true, 'data' => $user]);
    }

    public function destroy(User $user)
    {
        $user->delete();
        return response()->json(['success' => true]);
    }

    public function toggleBlock(User $user)
    {
        $user->blocked = !$user->blocked;
        $user->save();
        return response()->json(['success' => true, 'data' => $user]);
    }

    // Return combined balance and coin history for a user
    public function history(User $user)
    {
        $balance = BalanceHistory::where('user_id', $user->id)
            ->get()
            ->map(function($b){
                return [
                    'id' => $b->id,
                    'category' => 'balance',
                    'type' => $b->type,
                    'amount' => (string) $b->amount,
                    'source' => $b->source,
                    'description' => $b->description,
                    'balance_before' => (string) $b->balance_before,
                    'balance_after' => (string) $b->balance_after,
                    'created_at' => $b->created_at,
                ];
            });

        $coins = CoinHistory::where('user_id', $user->id)
            ->get()
            ->map(function($c){
                return [
                    'id' => $c->id,
                    'category' => 'coin',
                    'type' => $c->type,
                    'coins' => $c->coins,
                    'source' => $c->source,
                    'description' => $c->description,
                    'balance_before' => $c->balance_before,
                    'balance_after' => $c->balance_after,
                    'created_at' => $c->created_at,
                ];
            });

        // Merge and sort by created_at desc
        $merged = $balance->concat($coins)
            ->sortByDesc('created_at')
            ->values()
            ->all();

        return response()->json(['success' => true, 'data' => $merged]);
    }
}
