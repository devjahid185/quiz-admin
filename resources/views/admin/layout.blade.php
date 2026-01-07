<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title') - Quiz Admin</title>

    <script src="https://cdn.tailwindcss.com"></script>
    
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <style>
        body { font-family: 'Inter', sans-serif; }
    </style>
</head>

<body class="bg-gray-100 text-gray-800">

    <div class="flex h-screen overflow-hidden">

        <div id="sidebar-overlay" onclick="closeSidebar()" 
             class="fixed inset-0 z-40 bg-black/50 hidden lg:hidden transition-opacity opacity-0"></div>

        @include('admin.partials.sidebar')

        <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
            
            <header class="bg-white shadow-sm border-b border-gray-200 z-30">
                <div class="px-6 py-4 flex justify-between items-center">
                    
                    <div class="flex items-center lg:hidden">
                        <button onclick="openSidebar()" class="text-gray-500 hover:text-indigo-600 focus:outline-none">
                            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <span class="ml-4 text-lg font-bold text-gray-800">Quiz Admin</span>
                    </div>

                    <h1 class="hidden lg:block text-xl font-semibold text-gray-800">@yield('title')</h1>

                    <div class="flex items-center space-x-4">
                        <a href="{{ route('admin.profile') }}" class="flex items-center space-x-2 hover:bg-gray-50 p-1.5 rounded-lg transition-colors duration-200 group" title="View Profile">
                            <span class="text-sm text-gray-600 font-medium group-hover:text-indigo-600 transition-colors">
                                {{ Auth::guard('admin')->user()->name ?? 'Admin User' }}
                            </span>
                            <div class="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border border-indigo-200 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                {{ substr(Auth::guard('admin')->user()->name ?? 'A', 0, 1) }}
                            </div>
                        </a>
                    </div>

                </div>
            </header>

            <main class="flex-1 overflow-y-auto p-6 bg-gray-50">
                @yield('content')
            </main>

        </div>
    </div>

    <script>
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');

        function openSidebar() {
            // Sidebar Show
            sidebar.classList.remove('-translate-x-full');
            
            // Overlay Show
            overlay.classList.remove('hidden');
            setTimeout(() => {
                overlay.classList.remove('opacity-0');
            }, 10); // delay for transition
        }

        function closeSidebar() {
            // Sidebar Hide
            sidebar.classList.add('-translate-x-full');
            
            // Overlay Hide
            overlay.classList.add('opacity-0');
            setTimeout(() => {
                overlay.classList.add('hidden');
            }, 300); // match transition duration
        }
    </script>

</body>
</html>