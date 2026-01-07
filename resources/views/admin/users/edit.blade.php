@extends('admin.layout')
@section('title', 'Edit User')

@section('content')
<div class="container mx-auto py-8 max-w-4xl">
    
    <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Edit User: <span class="text-indigo-600">{{ $user->name }}</span></h1>
        <a href="{{ route('admin.users') }}" class="text-sm text-gray-600 hover:text-indigo-600 font-medium flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            Back to List
        </a>
    </div>

    <div class="bg-white rounded-2xl shadow border border-slate-100 overflow-hidden">
        <form method="POST" action="{{ route('admin.users.update', $user) }}" class="p-6 md:p-8">
            @csrf
            @method('PUT')
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="col-span-2">
                    <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wide border-b pb-2 mb-2">Account Details</h3>
                </div>

                <div class="col-span-2 md:col-span-1">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input type="text" name="name" value="{{ old('name', $user->name) }}"
                           class="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 shadow-sm py-2.5 px-4 transition duration-200">
                </div>

                <div class="col-span-2 md:col-span-1">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input type="email" name="email" value="{{ old('email', $user->email) }}"
                           class="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 shadow-sm py-2.5 px-4 transition duration-200">
                </div>

                <div class="col-span-2 mt-4">
                    <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wide border-b pb-2 mb-2">Security</h3>
                </div>

                <div class="col-span-2 md:col-span-1">
                    <label class="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <input type="password" name="password"
                           class="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 shadow-sm py-2.5 px-4 transition duration-200">
                    <p class="mt-1 text-xs text-gray-500">Leave blank to keep current password.</p>
                </div>

                <div class="col-span-2 md:col-span-1">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                    <input type="password" name="password_confirmation"
                           class="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 shadow-sm py-2.5 px-4 transition duration-200">
                </div>

                <div class="col-span-2 mt-4">
                    <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wide border-b pb-2 mb-2">Wallet Management</h3>
                </div>

                <div class="col-span-2 md:col-span-1">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Main Balance (৳)</label>
                    <div class="relative rounded-md shadow-sm">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span class="text-gray-500 sm:text-sm">৳</span>
                        </div>
                        <input type="number" step="0.01" name="main_balance" value="{{ old('main_balance', $user->main_balance) }}"
                               class="w-full pl-8 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 shadow-sm py-2.5 transition duration-200">
                    </div>
                </div>

                <div class="col-span-2 md:col-span-1">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Coin Balance</label>
                    <div class="relative rounded-md shadow-sm">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span class="text-gray-500 sm:text-sm">🪙</span>
                        </div>
                        <input type="number" name="coin_balance" value="{{ old('coin_balance', $user->coin_balance) }}"
                               class="w-full pl-8 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 shadow-sm py-2.5 transition duration-200">
                    </div>
                </div>
            </div>

            <div class="mt-8 flex justify-end space-x-3">
                <a href="{{ route('admin.users') }}" class="bg-white border border-slate-200 text-slate-700 px-6 py-2.5 rounded-lg hover:bg-slate-50 transition font-medium">
                    Cancel
                </a>
                <button type="submit" class="bg-indigo-600 text-white px-6 py-2.5 rounded-lg shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-semibold">
                    Update User
                </button>
            </div>
        </form>
    </div>
</div>
@endsection