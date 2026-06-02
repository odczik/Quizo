<?php

namespace Tests\Feature;

use App\Models\Quiz;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class QuizAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_view_a_public_quiz(): void
    {
        $user = User::factory()->create();
        $quiz = Quiz::create([
            'title' => 'Public quiz',
            'description' => 'Visible to everyone',
            'created_by' => $user->id,
            'is_public' => true,
            'default_time_limit' => 20,
        ]);

        $response = $this->getJson('/api/quizzes/' . $quiz->id);

        $response->assertOk();
        $response->assertJsonFragment([
            'id' => $quiz->id,
            'title' => 'Public quiz',
        ]);
    }

    public function test_guest_cannot_view_a_private_quiz(): void
    {
        $user = User::factory()->create();
        $quiz = Quiz::create([
            'title' => 'Private quiz',
            'description' => 'Only for the owner',
            'created_by' => $user->id,
            'is_public' => false,
            'default_time_limit' => 20,
        ]);

        $response = $this->getJson('/api/quizzes/' . $quiz->id);

        $response->assertForbidden();
    }
}