<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\User;

class QuizSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::first() ?? User::factory()->create();
        $now = Carbon::now();

        // Quiz 1: General Knowledge
        $quiz1Id = DB::table('quizzes')->insertGetId([
            'title' => 'General Knowledge Mastery',
            'description' => 'Test your everyday knowledge with these questions.',
            'created_by' => $user->id,
            'is_public' => true,
            'default_time_limit' => 30,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // General Knowledge - Multiple Choice
        $q1 = DB::table('questions')->insertGetId([
            'quiz_id' => $quiz1Id,
            'question_text' => 'What is the capital of France?',
            'question_type' => 'multiple_choice',
            'order_index' => 1,
            'created_at' => $now,
            'updated_at' => $now,
        ]);
        DB::table('answers')->insert([
            ['question_id' => $q1, 'answer_text' => 'London', 'is_correct' => false, 'created_at' => $now, 'updated_at' => $now],
            ['question_id' => $q1, 'answer_text' => 'Berlin', 'is_correct' => false, 'created_at' => $now, 'updated_at' => $now],
            ['question_id' => $q1, 'answer_text' => 'Paris', 'is_correct' => true, 'created_at' => $now, 'updated_at' => $now],
            ['question_id' => $q1, 'answer_text' => 'Madrid', 'is_correct' => false, 'created_at' => $now, 'updated_at' => $now],
        ]);

        // General Knowledge - True/False
        $q2 = DB::table('questions')->insertGetId([
            'quiz_id' => $quiz1Id,
            'question_text' => 'The Great Wall of China is visible from space with the naked eye.',
            'question_type' => 'true_false',
            'order_index' => 2,
            'created_at' => $now,
            'updated_at' => $now,
        ]);
        DB::table('answers')->insert([
            ['question_id' => $q2, 'answer_text' => 'True', 'is_correct' => false, 'created_at' => $now, 'updated_at' => $now],
            ['question_id' => $q2, 'answer_text' => 'False', 'is_correct' => true, 'created_at' => $now, 'updated_at' => $now],
        ]);

        // General Knowledge - Multiple Choice
        $q3 = DB::table('questions')->insertGetId([
            'quiz_id' => $quiz1Id,
            'question_text' => 'Who wrote "Hamlet"?',
            'question_type' => 'multiple_choice',
            'order_index' => 3,
            'created_at' => $now,
            'updated_at' => $now,
        ]);
        DB::table('answers')->insert([
            ['question_id' => $q3, 'answer_text' => 'J.R.R. Tolkien', 'is_correct' => false, 'created_at' => $now, 'updated_at' => $now],
            ['question_id' => $q3, 'answer_text' => 'William Shakespeare', 'is_correct' => true, 'created_at' => $now, 'updated_at' => $now],
            ['question_id' => $q3, 'answer_text' => 'Charles Dickens', 'is_correct' => false, 'created_at' => $now, 'updated_at' => $now],
            ['question_id' => $q3, 'answer_text' => 'Jane Austen', 'is_correct' => false, 'created_at' => $now, 'updated_at' => $now],
        ]);

        // Quiz 2: Science & Tech
        $quiz2Id = DB::table('quizzes')->insertGetId([
            'title' => 'Science & Tech Trivia',
            'description' => 'Explore the wonders of biology, physics, and computing.',
            'created_by' => $user->id,
            'is_public' => true,
            'default_time_limit' => 20,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // Science - True/False
        $q4 = DB::table('questions')->insertGetId([
            'quiz_id' => $quiz2Id,
            'question_text' => 'Water boils at 100 degrees Celsius at sea level.',
            'question_type' => 'true_false',
            'order_index' => 1,
            'created_at' => $now,
            'updated_at' => $now,
        ]);
        DB::table('answers')->insert([
            ['question_id' => $q4, 'answer_text' => 'True', 'is_correct' => true, 'created_at' => $now, 'updated_at' => $now],
            ['question_id' => $q4, 'answer_text' => 'False', 'is_correct' => false, 'created_at' => $now, 'updated_at' => $now],
        ]);

        // Science - Multiple Choice
        $q5 = DB::table('questions')->insertGetId([
            'quiz_id' => $quiz2Id,
            'question_text' => 'What is the most abundant gas in Earth\'s atmosphere?',
            'question_type' => 'multiple_choice',
            'order_index' => 2,
            'created_at' => $now,
            'updated_at' => $now,
        ]);
        DB::table('answers')->insert([
            ['question_id' => $q5, 'answer_text' => 'Oxygen', 'is_correct' => false, 'created_at' => $now, 'updated_at' => $now],
            ['question_id' => $q5, 'answer_text' => 'Carbon Dioxide', 'is_correct' => false, 'created_at' => $now, 'updated_at' => $now],
            ['question_id' => $q5, 'answer_text' => 'Nitrogen', 'is_correct' => true, 'created_at' => $now, 'updated_at' => $now],
            ['question_id' => $q5, 'answer_text' => 'Hydrogen', 'is_correct' => false, 'created_at' => $now, 'updated_at' => $now],
        ]);
    }
}
