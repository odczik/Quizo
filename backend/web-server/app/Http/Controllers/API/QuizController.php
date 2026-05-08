<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Models\Quiz;
use App\Models\Question;

class QuizController extends Controller
{
    // TODO toto je taky blbe
    public function listQuizzes()
    {
        // Logic to list quizzes

        $quizzes = Quiz::all();
        foreach ($quizzes as $quiz) {
            $this->authorize('get', $quiz);
        }
        return response()->json($quizzes);
    }

    public function createQuiz(Request $request)
    {
        // Logic to create a new quiz

        $request->validate([
            'title' => 'required|max:255',
            'description' => 'nullable|string',
            'is_public' => 'nullable|boolean',
            'default_time_limit' => 'nullable|integer|min:0',
        ]);

        // Create the quiz using the validated data

        $quiz = Quiz::create([
            'title' => $request->title,
            'description' => $request->description,
            'created_by' => Auth::id() ?? 0,
            'is_public' => $request->is_public ?? false,
            'default_time_limit' => $request->default_time_limit ?? 20,
        ]);

        return response()->json($quiz, 201);
    }

    // TODO tohle se musí upravit, protože to má vracet i otázky a odpovědi, ale prozatím to vrací jen quiz bez otázek
    public function getQuizDetails(Quiz $quiz)
    {
        $this->authorize('get', $quiz); // Returns 403 if quiz is not public and user is not creator
        Question::where('quiz_id', $quiz->id)->get()->each(function ($question) {
            $question->answers = $question->answers()->get();
        });
        return response()->json($quiz);
    }

    public function updateQuiz(Request $request, Quiz $quiz)
    {
        // Authorization: only owner can update
        $this->authorize('manage', $quiz); // Returns 403 if unauthorized

        $request->validate([
            'title' => 'required|max:255',
            'description' => 'nullable|string',
            'is_public' => 'nullable|boolean',
            'default_time_limit' => 'nullable|integer|min:0',
        ]);

        $quiz->update($request->all());

        return response()->json($quiz);
    }

    public function deleteQuiz(Quiz $quiz)
    {
        $this->authorize('manage', $quiz); // Returns 403 if unauthorized

        $quiz->delete();

        return response()->json(['message' => 'Quiz deleted successfully']);
    }

    public function addQuizQuestion(Request $request, Quiz $quiz)
    {
        // Logic to add a question to a quiz
    }

    public function updateQuizQuestion(Request $request, Quiz $quiz, Question $question)
    {
        // Logic to update a quiz question
    }

    public function deleteQuizQuestion(Quiz $quiz, Question $question)
    {
        // Logic to delete a quiz question
    }

    public function likeQuiz(Quiz $quiz)
    {
        // Logic to like a quiz
    }

    public function discoverQuizzes(Request $request)
    {
        // Logic to discover quizzes
    }
}
