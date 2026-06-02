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

    public function test_authenticated_user_receives_like_status_on_public_quiz(): void
    {
        $creator = User::factory()->create();
        $liker = User::factory()->create();
        $quiz = Quiz::create([
            'title' => 'Liked quiz',
            'description' => 'Public and liked',
            'created_by' => $creator->id,
            'is_public' => true,
            'default_time_limit' => 20,
        ]);

        $quiz->likes()->attach($liker->id, ['liked_at' => now()]);

        $response = $this->actingAs($liker)->getJson('/api/quizzes/' . $quiz->id);

        $response->assertOk();
        $response->assertJsonPath('liked_by_user', true);
    }

    public function test_authenticated_user_can_like_and_unlike_a_public_quiz(): void
    {
        $creator = User::factory()->create();
        $liker = User::factory()->create();
        $quiz = Quiz::create([
            'title' => 'Toggle like quiz',
            'description' => 'Public and toggleable',
            'created_by' => $creator->id,
            'is_public' => true,
            'default_time_limit' => 20,
        ]);

        $likeResponse = $this->actingAs($liker)->postJson('/api/quizzes/' . $quiz->id . '/like');

        $likeResponse->assertOk();
        $likeResponse->assertJsonPath('liked_by_user', true);
        $this->assertDatabaseHas('quiz_likes', [
            'user_id' => $liker->id,
            'quiz_id' => $quiz->id,
        ]);

        $unlikeResponse = $this->actingAs($liker)->deleteJson('/api/quizzes/' . $quiz->id . '/like');

        $unlikeResponse->assertOk();
        $unlikeResponse->assertJsonPath('liked_by_user', false);
        $this->assertDatabaseMissing('quiz_likes', [
            'user_id' => $liker->id,
            'quiz_id' => $quiz->id,
        ]);
    }
}