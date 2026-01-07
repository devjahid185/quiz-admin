@extends('admin.layout')

@section('title', 'Dashboard')

@section('content')

<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

    <div class="bg-white rounded-2xl shadow p-6 border border-slate-100">
        <div class="flex items-center justify-between">
            <div>
                <div class="text-sm text-slate-500">Total Quizzes</div>
                <div class="text-3xl font-bold mt-2">0</div>
            </div>
            <div class="bg-indigo-50 text-indigo-700 p-3 rounded-lg">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-6a2 2 0 012-2h2a2 2 0 012 2v6"/></svg>
            </div>
        </div>
    </div>

    <div class="bg-white rounded-2xl shadow p-6 border border-slate-100">
        <div class="flex items-center justify-between">
            <div>
                <div class="text-sm text-slate-500">Total Questions</div>
                <div class="text-3xl font-bold mt-2">0</div>
            </div>
            <div class="bg-indigo-50 text-indigo-700 p-3 rounded-lg">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h8M8 12h6"/></svg>
            </div>
        </div>
    </div>

    <div class="bg-white rounded-2xl shadow p-6 border border-slate-100">
        <div class="flex items-center justify-between">
            <div>
                <div class="text-sm text-slate-500">Total Users</div>
                <div class="text-3xl font-bold mt-2">0</div>
            </div>
            <div class="bg-indigo-50 text-indigo-700 p-3 rounded-lg">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.616 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            </div>
        </div>
    </div>

    <div class="bg-white rounded-2xl shadow p-6 border border-slate-100">
        <div class="flex items-center justify-between">
            <div>
                <div class="text-sm text-slate-500">Active Quizzes</div>
                <div class="text-3xl font-bold mt-2">0</div>
            </div>
            <div class="bg-indigo-50 text-indigo-700 p-3 rounded-lg">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3"/></svg>
            </div>
        </div>
    </div>

</div>

<!-- Extra Section -->
<div class="mt-8 bg-white rounded-2xl shadow p-6 border border-slate-100">
    <div class="flex items-center justify-between mb-3">
        <div>
            <h2 class="text-lg font-semibold">Quick Actions</h2>
            <p class="text-sm text-slate-500">Create quizzes, manage users and adjust settings quickly.</p>
        </div>
        <div class="hidden sm:flex items-center gap-2">
            <button class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition">Create Quiz</button>
            <button class="bg-white border border-slate-200 px-4 py-2 rounded hover:bg-slate-50 transition">Manage Users</button>
            <button class="bg-white border border-slate-200 px-4 py-2 rounded hover:bg-slate-50 transition">Settings</button>
        </div>
    </div>

    <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="p-4 bg-slate-50 rounded-lg">Placeholder for recent activity</div>
        <div class="p-4 bg-slate-50 rounded-lg">Placeholder for analytics</div>
        <div class="p-4 bg-slate-50 rounded-lg">Placeholder for announcements</div>
    </div>
</div>

@endsection
