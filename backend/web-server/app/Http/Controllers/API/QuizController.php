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
        // Require authenticated user to create quizzes
        if (!Auth::check()) {
            return response()->json(['message' => 'Authentication required to create a quiz.'], 401);
        }

        $request->validate([
            'title' => 'required|max:255',
            'description' => 'nullable|string',
            'is_public' => 'nullable|boolean',
            'default_time_limit' => 'nullable|integer|min:0',
            'image' => 'nullable|string',

            // Optional questions payload
            'questions' => 'sometimes|array',
            'questions.*.questionTitle' => 'required_with:questions|string|max:65535',
            'questions.*.type' => 'required_with:questions|string|in:multiple_choice,fill_in_blank',
            'questions.*.timeLimit' => 'sometimes|integer|min:0',
            'questions.*.answerOptions' => 'required_with:questions|array',
            'questions.*.answerOptions.*.text' => 'required_with:questions|string|max:65535',
            'questions.*.answerOptions.*.correct' => 'required_with:questions|boolean',
        ]);

        // Handle image upload
        $imageValue = null;
        if ($request->hasFile('image')) {
            // If it's a file upload, store it
            $imageValue = $request->file('image')->store('quiz-images', 'public');
        } elseif ($request->has('image') && $request->input('image')) {
            // If it's a string (URL or data URL), use it as-is
            $imageValue = $request->input('image');
        }

        // Create the quiz using the validated data
        $quiz = Quiz::create([
            'title' => $request->title,
            'description' => $request->description,
            'created_by' => Auth::id(),
            'is_public' => $request->is_public ?? false,
            'default_time_limit' => $request->default_time_limit ?? 20,
            'image' => $imageValue,
        ]);

        // If questions were provided, create them along with their answers
        if ($request->has('questions') && is_array($request->questions)) {
            foreach ($request->questions as $idx => $q) {
                $question = $quiz->questions()->create([
                    'question_text' => $q['questionTitle'] ?? '',
                    'question_type' => $q['type'] ?? 'multiple_choice',
                    'time_limit' => $q['timeLimit'] ?? 20,
                    'order_index' => $idx,
                ]);

                // Prepare answers for DB: answers table expects answer_text and is_correct
                $answersToCreate = [];
                if (!empty($q['answerOptions']) && is_array($q['answerOptions'])) {
                    foreach ($q['answerOptions'] as $ans) {
                        $answersToCreate[] = [
                            'answer_text' => $ans['text'] ?? '',
                            'is_correct' => $ans['correct'] ?? false,
                        ];
                    }
                }

                if (!empty($answersToCreate)) {
                    $question->answers()->createMany($answersToCreate);
                }
            }
        }

        $quiz->load('questions.answers');

        return response()->json($quiz, 201);
    }

    public function getQuizDetails(Quiz $quiz)
    {
        $this->authorize('get', $quiz); // Returns 403 if quiz is not public and user is not creator
        $quiz->load('questions.answers');

        $quiz->setAttribute(
            'liked_by_user',
            Auth::check() ? $quiz->likes()->where('user_id', Auth::id())->exists() : false
        );

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

            // Optional questions payload
            'questions' => 'sometimes|array',
            'questions.*.questionTitle' => 'required_with:questions|string|max:65535',
            'questions.*.type' => 'required_with:questions|string|in:multiple_choice,fill_in_blank',
            'questions.*.timeLimit' => 'sometimes|integer|min:0',
            'questions.*.answerOptions' => 'required_with:questions|array',
            'questions.*.answerOptions.*.text' => 'required_with:questions|string|max:65535',
            'questions.*.answerOptions.*.correct' => 'required_with:questions|boolean',
        ]);

        // Handle image update
        $imageValue = $quiz->image;
        if ($request->hasFile('image')) {
            // If it's a file upload, store it
            $imageValue = $request->file('image')->store('quiz-images', 'public');
        } elseif ($request->has('image') && $request->input('image')) {
            // If it's a string (URL or data URL), use it as-is
            $imageValue = $request->input('image');
        }

        // Update quiz metadata
        $quiz->update([
            'title' => $request->title,
            'description' => $request->description,
            'is_public' => $request->is_public ?? $quiz->is_public,
            'default_time_limit' => $request->default_time_limit ?? $quiz->default_time_limit,
            'image' => $imageValue,
        ]);

        // If questions were provided, delete all existing and recreate them
        if ($request->has('questions') && is_array($request->questions)) {
            // Delete all existing questions for this quiz
            $quiz->questions()->delete();

            // Create new questions with answers
            foreach ($request->questions as $idx => $q) {
                $question = $quiz->questions()->create([
                    'question_text' => $q['questionTitle'] ?? '',
                    'question_type' => $q['type'] ?? 'multiple_choice',
                    'time_limit' => $q['timeLimit'] ?? 20,
                    'order_index' => $idx,
                ]);

                // Prepare answers for DB: answers table expects answer_text and is_correct
                $answersToCreate = [];
                if (!empty($q['answerOptions']) && is_array($q['answerOptions'])) {
                    foreach ($q['answerOptions'] as $ans) {
                        $answersToCreate[] = [
                            'answer_text' => $ans['text'] ?? '',
                            'is_correct' => $ans['correct'] ?? false,
                        ];
                    }
                }

                if (!empty($answersToCreate)) {
                    $question->answers()->createMany($answersToCreate);
                }
            }
        }

        $quiz->load('questions.answers');

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
            'question_type' => 'sometimes|required|string|in:multiple_choice,true_false,fill_in_blank',


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
            'question_type' => 'sometimes|required|string|in:multiple_choice,true_false,fill_in_blank',


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

        $userId = Auth::id();

        if (!$quiz->likes()->where('user_id', $userId)->exists()) {
            $quiz->likes()->attach($userId, ['liked_at' => now()]);
        }

        return response()->json([
            'message' => 'Quiz liked successfully',
            'liked_by_user' => true,
        ]);
    }

    public function unlikeQuiz(Quiz $quiz)
    {
        $this->authorize('get', $quiz); // Returns 403 if quiz is not public and user is not creator

        $quiz->likes()->detach(Auth::id());

        return response()->json([
            'message' => 'Quiz unliked successfully',
            'liked_by_user' => false,
        ]);
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
