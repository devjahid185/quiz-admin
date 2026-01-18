<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminApiController;
use App\Http\Controllers\AdminAuthController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\AdminUserApiController;
use App\Http\Controllers\Admin\AdminProfileController;
use App\Http\Controllers\AdminFeatureQuizApiController;

Route::get('/', function () {
    return view('welcome');
});

// CSRF cookie endpoint for SPA clients (root path). This sets the XSRF-TOKEN cookie.
Route::get('/sanctum/csrf-cookie', function () {
    return response()->json(['success' => true]);
});

// API endpoints used by the React admin frontend (use web/session auth)
Route::prefix('api')->group(function () {
    Route::post('/admin/login', [AdminApiController::class, 'login']);
    Route::get('/admin/check', [AdminApiController::class, 'check']);
    Route::post('/admin/logout', [AdminApiController::class, 'logout']);
    Route::get('/admin/dashboard/statistics', [\App\Http\Controllers\AdminDashboardApiController::class, 'statistics']);

    // Provide a simple CSRF cookie endpoint for SPA (sets XSRF-TOKEN cookie)
    Route::get('/sanctum/csrf-cookie', function () {
        return response()->json(['success' => true]);
    });

    // Admin users API
    Route::get('/admin/users', [AdminUserApiController::class, 'index']);
    Route::post('/admin/users', [AdminUserApiController::class, 'store']);
    Route::get('/admin/users/{user}', [AdminUserApiController::class, 'show']);
    Route::put('/admin/users/{user}', [AdminUserApiController::class, 'update']);
    Route::delete('/admin/users/{user}', [AdminUserApiController::class, 'destroy']);
    Route::post('/admin/users/{user}/block', [AdminUserApiController::class, 'toggleBlock']);
    Route::get('/admin/users/{user}/history', [AdminUserApiController::class, 'history']);

    // Admin banners API
    Route::get('/admin/banners', [\App\Http\Controllers\AdminBannerApiController::class, 'index']);
    Route::post('/admin/banners', [\App\Http\Controllers\AdminBannerApiController::class, 'store']);
    Route::get('/admin/banners/{banner}', [\App\Http\Controllers\AdminBannerApiController::class, 'show']);
    Route::put('/admin/banners/{banner}', [\App\Http\Controllers\AdminBannerApiController::class, 'update']);
    Route::delete('/admin/banners/{banner}', [\App\Http\Controllers\AdminBannerApiController::class, 'destroy']);
    Route::post('/admin/banners/{banner}/toggle', [\App\Http\Controllers\AdminBannerApiController::class, 'toggleActive']);
    
    // Admin promotional images
    Route::get('/admin/promotional-images', [\App\Http\Controllers\AdminPromotionalImageApiController::class, 'index']);
    Route::post('/admin/promotional-images', [\App\Http\Controllers\AdminPromotionalImageApiController::class, 'store']);
    Route::get('/admin/promotional-images/{promotionalImage}', [\App\Http\Controllers\AdminPromotionalImageApiController::class, 'show']);
    Route::put('/admin/promotional-images/{promotionalImage}', [\App\Http\Controllers\AdminPromotionalImageApiController::class, 'update']);
    Route::delete('/admin/promotional-images/{promotionalImage}', [\App\Http\Controllers\AdminPromotionalImageApiController::class, 'destroy']);
    Route::post('/admin/promotional-images/{promotionalImage}/toggle', [\App\Http\Controllers\AdminPromotionalImageApiController::class, 'toggleActive']);

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

    // Admin sub-categories API
    Route::get('/admin/sub-categories', [\App\Http\Controllers\AdminSubCategoryApiController::class, 'index']);
    Route::post('/admin/sub-categories', [\App\Http\Controllers\AdminSubCategoryApiController::class, 'store']);
    Route::get('/admin/sub-categories/{subCategory}', [\App\Http\Controllers\AdminSubCategoryApiController::class, 'show']);
    Route::put('/admin/sub-categories/{subCategory}', [\App\Http\Controllers\AdminSubCategoryApiController::class, 'update']);
    Route::delete('/admin/sub-categories/{subCategory}', [\App\Http\Controllers\AdminSubCategoryApiController::class, 'destroy']);
    Route::post('/admin/sub-categories/sort', [\App\Http\Controllers\AdminSubCategoryApiController::class, 'sort']);

    // Admin quizzes API
    Route::get('/admin/quizzes', [\App\Http\Controllers\AdminQuizApiController::class, 'index']);
    Route::post('/admin/quizzes', [\App\Http\Controllers\AdminQuizApiController::class, 'store']);
    Route::get('/admin/quizzes/{quiz}', [\App\Http\Controllers\AdminQuizApiController::class, 'show']);
    Route::put('/admin/quizzes/{quiz}', [\App\Http\Controllers\AdminQuizApiController::class, 'update']);
    Route::delete('/admin/quizzes/{quiz}', [\App\Http\Controllers\AdminQuizApiController::class, 'destroy']);
    Route::post('/admin/quizzes/sort', [\App\Http\Controllers\AdminQuizApiController::class, 'sort']);
    Route::post('/admin/quizzes/import', [\App\Http\Controllers\AdminQuizApiController::class, 'import']);

    // FeatureQuiz CRUD
    Route::get('/feature-quizzes', [AdminFeatureQuizApiController::class, 'index']);
    Route::post('/feature-quizzes', [AdminFeatureQuizApiController::class, 'store']);
    Route::get('/feature-quizzes/{featureQuiz}', [AdminFeatureQuizApiController::class, 'show']);
    Route::put('/feature-quizzes/{featureQuiz}', [AdminFeatureQuizApiController::class, 'update']);
    Route::delete('/feature-quizzes/{featureQuiz}', [AdminFeatureQuizApiController::class, 'destroy']);
    Route::post('/feature-quizzes/sort', [AdminFeatureQuizApiController::class, 'sort']);
    Route::post('/feature-quizzes/import', [AdminFeatureQuizApiController::class, 'import']);

    // Admin Questions API
    Route::get('/admin/questions', [\App\Http\Controllers\AdminQuestionApiController::class, 'index']);
    Route::post('/admin/questions', [\App\Http\Controllers\AdminQuestionApiController::class, 'store']);
    Route::get('/admin/questions/{question}', [\App\Http\Controllers\AdminQuestionApiController::class, 'show']);
    Route::put('/admin/questions/{question}', [\App\Http\Controllers\AdminQuestionApiController::class, 'update']);
    Route::delete('/admin/questions/{question}', [\App\Http\Controllers\AdminQuestionApiController::class, 'destroy']);
    Route::post('/admin/questions/import', [\App\Http\Controllers\AdminQuestionApiController::class, 'import']);

    // Admin Leaderboard API
    Route::get('/admin/leaderboard', [\App\Http\Controllers\AdminLeaderboardApiController::class, 'index']);
    Route::get('/admin/leaderboard/coin-history', [\App\Http\Controllers\AdminLeaderboardApiController::class, 'coinHistory']);

    // Admin Notifications API
    Route::get('/admin/notifications/users', [\App\Http\Controllers\AdminNotificationApiController::class, 'getUsersWithTokens']);
    Route::post('/admin/notifications/send', [\App\Http\Controllers\AdminNotificationApiController::class, 'sendNotification']);
    Route::post('/admin/notifications/send-to-all', [\App\Http\Controllers\AdminNotificationApiController::class, 'sendToAll']);

    // Admin Coin Conversion Settings API
    Route::get('/admin/coin-conversion', [\App\Http\Controllers\AdminCoinConversionApiController::class, 'index']);
    Route::get('/admin/coin-conversion/active', [\App\Http\Controllers\AdminCoinConversionApiController::class, 'getActive']);
    Route::post('/admin/coin-conversion', [\App\Http\Controllers\AdminCoinConversionApiController::class, 'store']);
    Route::put('/admin/coin-conversion/{coinConversionSetting}', [\App\Http\Controllers\AdminCoinConversionApiController::class, 'update']);
    Route::delete('/admin/coin-conversion/{coinConversionSetting}', [\App\Http\Controllers\AdminCoinConversionApiController::class, 'destroy']);
    Route::post('/admin/coin-conversion/{coinConversionSetting}/toggle-active', [\App\Http\Controllers\AdminCoinConversionApiController::class, 'toggleActive']);

    // Admin Withdrawal Management API
    Route::get('/admin/withdrawal/settings', [\App\Http\Controllers\AdminWithdrawalApiController::class, 'getSettings']);
    Route::get('/admin/withdrawal/settings/active', [\App\Http\Controllers\AdminWithdrawalApiController::class, 'getActiveSetting']);
    Route::post('/admin/withdrawal/settings', [\App\Http\Controllers\AdminWithdrawalApiController::class, 'storeSettings']);
    Route::put('/admin/withdrawal/settings/{withdrawalSetting}', [\App\Http\Controllers\AdminWithdrawalApiController::class, 'updateSettings']);
    Route::delete('/admin/withdrawal/settings/{withdrawalSetting}', [\App\Http\Controllers\AdminWithdrawalApiController::class, 'deleteSettings']);
    Route::post('/admin/withdrawal/settings/{withdrawalSetting}/toggle-active', [\App\Http\Controllers\AdminWithdrawalApiController::class, 'toggleActiveSettings']);
    
    Route::get('/admin/withdrawal/requests', [\App\Http\Controllers\AdminWithdrawalApiController::class, 'getRequests']);
    Route::get('/admin/withdrawal/request/{id}', [\App\Http\Controllers\AdminWithdrawalApiController::class, 'getRequestDetails']);
    Route::post('/admin/withdrawal/request/{id}/approve', [\App\Http\Controllers\AdminWithdrawalApiController::class, 'approveRequest']);
    Route::post('/admin/withdrawal/request/{id}/reject', [\App\Http\Controllers\AdminWithdrawalApiController::class, 'rejectRequest']);
    Route::post('/admin/withdrawal/request/{id}/complete', [\App\Http\Controllers\AdminWithdrawalApiController::class, 'completeRequest']);
    Route::put('/admin/withdrawal/request/{id}/status', [\App\Http\Controllers\AdminWithdrawalApiController::class, 'updateStatus']);

    // Admin alerts (polling)
    Route::get('/admin/alerts', [\App\Http\Controllers\AdminAlertsApiController::class, 'index']);
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

    // Sub Category Management
    Route::prefix('sub-categories')->name('admin.sub-categories.')->group(function () {
        Route::get('/', [\App\Http\Controllers\SubCategoryController::class, 'index'])->name('index');
        Route::get('/create', [\App\Http\Controllers\SubCategoryController::class, 'create'])->name('create');
        Route::post('/', [\App\Http\Controllers\SubCategoryController::class, 'store'])->name('store');
        Route::get('/{id}/edit', [\App\Http\Controllers\SubCategoryController::class, 'edit'])->name('edit');
        Route::put('/{id}', [\App\Http\Controllers\SubCategoryController::class, 'update'])->name('update');
        Route::delete('/{id}', [\App\Http\Controllers\SubCategoryController::class, 'destroy'])->name('destroy');
    });
    Route::post(
        '/admin/sub-categories/sort',
        [\App\Http\Controllers\SubCategoryController::class, 'sort']
    )->name('admin.sub-categories.sort');
});
