<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthenticationController;
Route::middleware('web')->group(function () {
    Route::post('user/register', [AuthenticationController::class, 'register']);
    Route::post('user/login', [AuthenticationController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('user/profile', [AuthenticationController::class, 'getUserData']); 
        Route::post('user/logout', [AuthenticationController::class, 'logOut']);
        Route::put('user/profile', [AuthenticationController::class, 'updateUserData']);
        Route::put('user/password', [AuthenticationController::class, 'updateUserPassword']);
        Route::delete('user/profile', [AuthenticationController::class, 'deleteUser']);
    });
});
