<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Models\Quiz;
use App\Models\Question;

class QuizController extends Controller
{
    public function listQuizzes()
    {
        // Logic to list quizzes

        $quizzesCreated = Auth::check() ? Quiz::where('created_by', Auth::id())->get() : collect();
        $quizzesLiked = Auth::check() ? Quiz::whereHas('likes', fn($q) => $q->where('user_id', Auth::id()))->get() : collect();
        return response()->json([
            'created' => $quizzesCreated,
            'liked' => $quizzesLiked
        ]);
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
            'created_by' => Auth::id(),
            'is_public' => $request->is_public ?? false,
            'default_time_limit' => $request->default_time_limit ?? 20,
        ]);

        return response()->json($quiz, 201);
    }

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
        $this->authorize('manage', $quiz); // Returns 403 if unauthorized

        $request->validate([
            'question_text' => 'required|string|max:255',
            'question_type' => 'sometimes|required|between:0,1',


            // Inputs for answers table
            'answers' => 'required|array',
            'answers.*.text' => 'required|string|max:255',
            'answers.*.is_correct' => 'required|boolean',
        ]);

        $question = $quiz->questions()->create([
            'question_text' => $request->question_text,
            'question_type' => $request->question_type ?? 0,
        ]);

        $question->answers()->createMany($request->answers);

        return response()->json($question, 201);
    }

    public function updateQuizQuestion(Request $request, Quiz $quiz, Question $question)
    {
        $this->authorize('manage', $quiz); // Returns 403 if unauthorized

        $request->validate([
            'question_text' => 'required|string|max:255',
            'question_type' => 'sometimes|required|between:0,1',


            // Inputs for answers table
            'answers' => 'required|array',
            'answers.*.text' => 'required|string|max:255',
            'answers.*.is_correct' => 'required|boolean',
        ]);

        $question->update([
            'question_text' => $request->question_text,
            'question_type' => $request->question_type ?? 0,
        ]);

        // Delete existing answers and create new ones
        $question->answers()->delete();
        $question->answers()->createMany($request->answers);

        return response()->json($question);
    }

    public function deleteQuizQuestion(Quiz $quiz, Question $question)
    {
        $this->authorize('manage', $quiz); // Returns 403 if unauthorized

        $question->delete();

        return response()->json(['message' => 'Question deleted successfully']);
    }

    public function likeQuiz(Quiz $quiz)
    {
        $this->authorize('get', $quiz); // Returns 403 if quiz is not public and user is not creator

        
        
        return response()->json(['message' => 'Quiz liked successfully']);
    }

    public function discoverQuizzes(Request $request)
    {
        $query = Quiz::where('is_public', true)
            ->leftJoin('users', 'quizzes.created_by', '=', 'users.id')
            ->select('quizzes.*', 'users.name as created_by');

        // Apply liked filter
        if ($request->has('liked_only') && $request->liked_only == '1') {
            if (Auth::check()) {
                $query->join('quiz_likes', 'quizzes.id', '=', 'quiz_likes.quiz_id')
                      ->where('quiz_likes.user_id', Auth::id());
            } else {
                return response()->json([]);
            }
        }

        // Apply search filter
        if ($request->has('search') && !empty($request->search)) {
            $searchTerm = '%' . $request->search . '%';
            $query->where(function($q) use ($searchTerm) {
                $q->where('quizzes.title', 'like', $searchTerm)
                  ->orWhere('quizzes.description', 'like', $searchTerm);
            });
        }

        // Apply sorting
        switch ($request->sort) {
            case 'oldest':
                $query->orderBy('quizzes.created_at', 'asc');
                break;
            case 'az':
                $query->orderBy('quizzes.title', 'asc');
                break;
            case 'za':
                $query->orderBy('quizzes.title', 'desc');
                break;
            case 'newest':
            default:
                $query->orderBy('quizzes.created_at', 'desc');
                break;
        }

        return response()->json($query->get());
    }
}
