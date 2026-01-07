<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminAuthController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\AdminProfileController;
use App\Http\Controllers\AdminApiController;
use App\Http\Controllers\AdminUserApiController;

Route::get('/', function () {
    return view('welcome');
});

// CSRF cookie endpoint for SPA clients (root path). This sets the XSRF-TOKEN cookie.
Route::get('/sanctum/csrf-cookie', function () {
    $cookie = cookie('XSRF-TOKEN', csrf_token(), 0, null, null, false, false);
    return response()->json(['success' => true])->withCookie($cookie);
});

// API endpoints used by the React admin frontend (use web/session auth)
Route::prefix('api')->group(function () {
    Route::post('/admin/login', [AdminApiController::class, 'login']);
    Route::get('/admin/check', [AdminApiController::class, 'check']);
    Route::post('/admin/logout', [AdminApiController::class, 'logout']);

    // Provide a simple CSRF cookie endpoint for SPA (sets XSRF-TOKEN cookie)
    Route::get('/sanctum/csrf-cookie', function () {
        $cookie = cookie('XSRF-TOKEN', urlencode(csrf_token()), 0, null, null, false, false);
        return response()->json(['success' => true])->withCookie($cookie);
    });

    // Admin users API
    Route::get('/admin/users', [AdminUserApiController::class, 'index']);
    Route::post('/admin/users', [AdminUserApiController::class, 'store']);
    Route::get('/admin/users/{user}', [AdminUserApiController::class, 'show']);
    Route::put('/admin/users/{user}', [AdminUserApiController::class, 'update']);
    Route::delete('/admin/users/{user}', [AdminUserApiController::class, 'destroy']);
    Route::post('/admin/users/{user}/block', [AdminUserApiController::class, 'toggleBlock']);
    
    // Admin profile APIs (use session auth)
    Route::get('/admin/profile', [\App\Http\Controllers\AdminProfileApiController::class, 'show']);
    Route::put('/admin/profile/update', [\App\Http\Controllers\AdminProfileApiController::class, 'updateProfile']);
    Route::put('/admin/profile/password', [\App\Http\Controllers\AdminProfileApiController::class, 'updatePassword']);

    // Admin categories API
    Route::get('/admin/categories', [\App\Http\Controllers\AdminCategoryApiController::class, 'index']);
    Route::post('/admin/categories', [\App\Http\Controllers\AdminCategoryApiController::class, 'store']);
    Route::get('/admin/categories/{category}', [\App\Http\Controllers\AdminCategoryApiController::class, 'show']);
    Route::put('/admin/categories/{category}', [\App\Http\Controllers\AdminCategoryApiController::class, 'update']);
    Route::delete('/admin/categories/{category}', [\App\Http\Controllers\AdminCategoryApiController::class, 'destroy']);
    Route::post('/admin/categories/sort', [\App\Http\Controllers\AdminCategoryApiController::class, 'sort']);

    // Admin features API
    Route::get('/admin/features', [\App\Http\Controllers\AdminFeaturesApiController::class, 'index']);
    Route::post('/admin/features', [\App\Http\Controllers\AdminFeaturesApiController::class, 'store']);
    Route::get('/admin/features/{features}', [\App\Http\Controllers\AdminFeaturesApiController::class, 'show']);
    Route::put('/admin/features/{features}', [\App\Http\Controllers\AdminFeaturesApiController::class, 'update']);
    Route::delete('/admin/features/{features}', [\App\Http\Controllers\AdminFeaturesApiController::class, 'destroy']);
    Route::post('/admin/features/sort', [\App\Http\Controllers\AdminFeaturesApiController::class, 'sort']);
});

// Provide a simple CSRF cookie endpoint for SPA (sets XSRF-TOKEN cookie)
    Route::get('/sanctum/csrf-cookie', function () {
        $cookie = cookie('XSRF-TOKEN', urlencode(csrf_token()), 0, null, null, false, false);
        return response()->json(['success' => true])->withCookie($cookie);
    });

Route::get('/admin/login', [AdminAuthController::class, 'loginForm'])->name('admin.login');
Route::post('/admin/login', [AdminAuthController::class, 'login']);

Route::middleware('auth:admin')->group(function () {
    Route::get('/admin/dashboard', [AdminAuthController::class, 'dashboard'])->name('admin.dashboard');
    Route::get('/admin/logout', [AdminAuthController::class, 'logout'])->name('admin.logout');

    Route::get('/users', [UserController::class, 'index'])->name('admin.users');
    Route::get('/users/create', [UserController::class, 'create'])->name('admin.users.create');
    Route::post('/users', [UserController::class, 'store'])->name('admin.users.store');
    Route::get('/users/{user}/edit', [UserController::class, 'edit'])->name('admin.users.edit');
    Route::put('/users/{user}', [UserController::class, 'update'])->name('admin.users.update');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('admin.users.destroy');

    Route::post('/users/{user}/block', [UserController::class, 'toggleBlock'])->name('admin.users.block');

    // Profile Routes
    Route::get('/profile', [AdminProfileController::class, 'show'])->name('admin.profile');
    Route::put('/profile/update', [AdminProfileController::class, 'updateProfile'])->name('admin.profile.update');
    Route::put('/profile/password', [AdminProfileController::class, 'updatePassword'])->name('admin.password.update');

    // Category Management
    Route::prefix('categories')->name('admin.categories.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Admin\CategoryController::class, 'index'])->name('index');
        Route::get('/create', [\App\Http\Controllers\Admin\CategoryController::class, 'create'])->name('create');
        Route::post('/', [\App\Http\Controllers\Admin\CategoryController::class, 'store'])->name('store');
        Route::get('/{category}/edit', [\App\Http\Controllers\Admin\CategoryController::class, 'edit'])->name('edit');
        Route::put('/{category}', [\App\Http\Controllers\Admin\CategoryController::class, 'update'])->name('update');
        Route::delete('/{category}', [\App\Http\Controllers\Admin\CategoryController::class, 'destroy'])->name('destroy');
    });
    Route::post(
        '/admin/categories/sort',
        [\App\Http\Controllers\Admin\CategoryController::class, 'sort']
    )->name('admin.categories.sort');

    // Features Management
    Route::prefix('features')->name('admin.features.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Admin\FeaturesController::class, 'index'])->name('index');
        Route::get('/create', [\App\Http\Controllers\Admin\FeaturesController::class, 'create'])->name('create');
        Route::post('/', [\App\Http\Controllers\Admin\FeaturesController::class, 'store'])->name('store');
        Route::get('/{features}/edit', [\App\Http\Controllers\Admin\FeaturesController::class, 'edit'])->name('edit');
        Route::put('/{features}', [\App\Http\Controllers\Admin\FeaturesController::class, 'update'])->name('update');
        Route::delete('/{features}', [\App\Http\Controllers\Admin\FeaturesController::class, 'destroy'])->name('destroy');
    });
    Route::post(
        '/admin/features/sort',
        [\App\Http\Controllers\Admin\FeaturesController::class, 'sort']
    )->name('admin.features.sort');
});
