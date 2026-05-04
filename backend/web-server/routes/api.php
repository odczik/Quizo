<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthenticationController;
use App\Http\Controllers\API\QuizController;

Route::middleware('web')->group(function () {
    Route::post('user/register', [AuthenticationController::class, 'register']);
    Route::post('user/login', [AuthenticationController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        // User Management API routes
        Route::get('user/profile', [AuthenticationController::class, 'getUserData']); 
        Route::post('user/logout', [AuthenticationController::class, 'logOut']);
        Route::put('user/profile', [AuthenticationController::class, 'updateUserData']);
        Route::put('user/password', [AuthenticationController::class, 'updateUserPassword']);
        Route::delete('user/profile', [AuthenticationController::class, 'deleteUser']);
    });
});

// Quiz Management API routes
Route::get('quizzes', [QuizController::class, 'listQuizzes']);
Route::post('quizzes', [QuizController::class, 'createQuiz']);
Route::get('quizzes/{id}', [QuizController::class, 'getQuizDetails']);
Route::put('quizzes/{id}', [QuizController::class, 'updateQuiz']);
Route::delete('quizzes/{id}', [QuizController::class, 'deleteQuiz']);

// Quiz Question Management API routes
Route::post('quizzes/{id}/questions', [QuizController::class, 'addQuizQuestion']);
Route::put('quizzes/{id}/questions/{questionId}', [QuizController::class, 'updateQuizQuestion']);
Route::delete('quizzes/{id}/questions/{questionId}', [QuizController::class, 'deleteQuizQuestion']);

// Quiz Like API route
Route::post('quizzes/{id}/like', [QuizController::class, 'likeQuiz']);

// Discovery Page API route
Route::GET('discover', [QuizController::class, 'discoverQuizzes']);
