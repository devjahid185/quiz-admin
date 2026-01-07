<aside id="sidebar" 
    class="fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transition-transform duration-300 transform -translate-x-full lg:translate-x-0 lg:static lg:inset-0 flex flex-col h-screen shadow-2xl">

    <div class="flex items-center justify-center h-16 bg-slate-950 border-b border-slate-800 shadow-sm">
        <h1 class="text-2xl font-bold tracking-wider text-white">
            <span class="text-indigo-500">Quiz</span>Admin
        </h1>
    </div>

    <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        
        <a href="{{ route('admin.dashboard') }}" 
           class="flex items-center px-4 py-3 transition-colors duration-200 transform rounded-lg hover:bg-indigo-600 hover:text-white group {{ request()->routeIs('admin.dashboard') ? 'bg-indigo-600 text-white' : 'text-slate-400' }}">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span class="mx-4 font-medium">Dashboard</span>
        </a>

        <a href="#" 
           class="flex items-center px-4 py-3 transition-colors duration-200 transform rounded-lg hover:bg-indigo-600 hover:text-white group text-slate-400">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="mx-4 font-medium">Quizzes</span>
        </a>

        <a href="{{ route('admin.categories.index') }}" 
           class="flex items-center px-4 py-3 transition-colors duration-200 transform rounded-lg hover:bg-indigo-600 hover:text-white group text-slate-400">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="mx-4 font-medium">Category</span>
        </a>

        <a href="{{ route('admin.features.index') }}" 
           class="flex items-center px-4 py-3 transition-colors duration-200 transform rounded-lg hover:bg-indigo-600 hover:text-white group text-slate-400">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="mx-4 font-medium">Features</span>
        </a>

        <a href="{{ route('admin.users') }}" 
           class="flex items-center px-4 py-3 transition-colors duration-200 transform rounded-lg hover:bg-indigo-600 hover:text-white group {{ request()->routeIs('admin.users*') ? 'bg-indigo-600 text-white' : 'text-slate-400' }}">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span class="mx-4 font-medium">Users</span>
        </a>

        <a href="#" 
           class="flex items-center px-4 py-3 transition-colors duration-200 transform rounded-lg hover:bg-indigo-600 hover:text-white group text-slate-400">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span class="mx-4 font-medium">Settings</span>
        </a>
    </nav>

    <div class="p-4 bg-slate-950 border-t border-slate-800">
        <a href="{{ route('admin.logout') }}" class="flex items-center w-full px-4 py-2 text-slate-400 rounded-lg hover:bg-red-600 hover:text-white transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span class="mx-4 font-medium">Logout</span>
        </a>
    </div>
</aside>