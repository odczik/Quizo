<?php

namespace App\Policies;

use App\Models\Quiz;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class QuizPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can get the quiz (is public or is creator).
     */
    public function get(?User $user, Quiz $quiz): bool
    {
        return $quiz->is_public || ($user !== null && $user->id === $quiz->created_by);
    }

    /**
     * Determine whether the user can update or delete the quiz.
     */
    public function manage(User $user, Quiz $quiz): bool
    {
        return $user->id === $quiz->created_by;
    }
}