<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\GameController;
use App\Http\Controllers\Api\CategoryApiController;
use App\Http\Controllers\Api\FeaturesApiController;
use App\Http\Controllers\Api\LeaderboardApiController;
use App\Http\Controllers\AdminFeatureQuizApiController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/send-otp', [AuthController::class, 'sendOtp']);
Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);
Route::get('/user', [AuthController::class, 'user']);
Route::post('/update-profile', [AuthController::class, 'updateProfile']);
Route::post('/change-password', [AuthController::class, 'changePassword']);
Route::post('/user-balance', [AuthController::class, 'getBalanceByEmail']);
Route::post('/update-coin', [AuthController::class, 'updateCoinBalance']);
Route::post('/logout', [AuthController::class, 'logout']);
Route::get('/categories', [CategoryApiController::class, 'index']);

Route::get('/features', [FeaturesApiController::class, 'index']);

Route::post('/create-room', [GameController::class, 'createRoom']);
Route::post('/join-room', [GameController::class, 'joinRoom']);
Route::post('/leave-room', [GameController::class, 'leaveRoom']);
Route::post('/kick-player', [GameController::class, 'kickPlayer']);
Route::post('/start-game', [GameController::class, 'startGame']);
Route::post('/submit-answer', [GameController::class, 'submitAnswer']);

// Leaderboard API (for Flutter)
Route::get('/leaderboard', [LeaderboardApiController::class, 'index']);
Route::get('/leaderboard/history', [LeaderboardApiController::class, 'userHistory']);
Route::post('/leaderboard/add-coin-history', [LeaderboardApiController::class, 'addCoinHistory']);

// Coin Conversion API (for Flutter)
Route::get('/coin-conversion/rate', [\App\Http\Controllers\Api\CoinConversionApiController::class, 'getConversionRate']);
Route::post('/coin-conversion/preview', [\App\Http\Controllers\Api\CoinConversionApiController::class, 'previewConversion']);
Route::post('/coin-conversion/convert', [\App\Http\Controllers\Api\CoinConversionApiController::class, 'convertCoins']);

// Withdrawal API (for Flutter)
Route::get('/withdrawal/settings', [\App\Http\Controllers\Api\WithdrawalApiController::class, 'getSettings']);
Route::post('/withdrawal/calculate-fee', [\App\Http\Controllers\Api\WithdrawalApiController::class, 'calculateFee']);
Route::post('/withdrawal/request', [\App\Http\Controllers\Api\WithdrawalApiController::class, 'createRequest']);
Route::get('/withdrawal/requests', [\App\Http\Controllers\Api\WithdrawalApiController::class, 'getUserRequests']);
Route::get('/withdrawal/request/{id}', [\App\Http\Controllers\Api\WithdrawalApiController::class, 'getRequestDetails']);
Route::post('/withdrawal/request/{id}/cancel', [\App\Http\Controllers\Api\WithdrawalApiController::class, 'cancelRequest']);
Route::get('/withdrawal/balance-history', [\App\Http\Controllers\Api\WithdrawalApiController::class, 'getBalanceHistory']);