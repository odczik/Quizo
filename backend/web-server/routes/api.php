<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthenticationController;
use App\Http\Controllers\API\QuizController;


Route::post('user/register', [AuthenticationController::class, 'register']);
Route::post('user/login', [AuthenticationController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    // User Management API routes
    Route::get('user/profile', [AuthenticationController::class, 'getUserData']); 
    Route::post('user/logout', [AuthenticationController::class, 'logOut']);
    Route::put('user/profile', [AuthenticationController::class, 'updateUserData']);
    Route::put('user/password', [AuthenticationController::class, 'updateUserPassword']);
    Route::delete('user/profile', [AuthenticationController::class, 'deleteUser']);

    // Quiz Management API routes
    Route::get('quizzes', [QuizController::class, 'listQuizzes']);
    Route::post('quizzes', [QuizController::class, 'createQuiz']);
    Route::get('quizzes/{quiz}', [QuizController::class, 'getQuizDetails']);
    Route::put('quizzes/{quiz}', [QuizController::class, 'updateQuiz']);
    Route::delete('quizzes/{quiz}', [QuizController::class, 'deleteQuiz']);

    // Quiz Question Management API routes
    Route::post('quizzes/{quiz}/questions', [QuizController::class, 'addQuizQuestion']);
    Route::put('quizzes/{quiz}/questions/{question}', [QuizController::class, 'updateQuizQuestion']);
    Route::delete('quizzes/{quiz}/questions/{question}', [QuizController::class, 'deleteQuizQuestion']);

    // Quiz Like API route
    Route::post('quizzes/{quiz}/like', [QuizController::class, 'likeQuiz']);
});

// Discovery Page API route
Route::get('discover', [QuizController::class, 'discoverQuizzes']);
