<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\GameController;
use App\Http\Controllers\Api\CategoryApiController;
use App\Http\Controllers\Api\FeaturesApiController;
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