<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['title', 'description', 'is_public', 'default_time_limit', 'image', 'created_by'])]
class Quiz extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_public' => 'boolean',
            'default_time_limit' => 'integer'
        ];
    }

    public function questions()
    {
        return $this->hasMany(Question::class);
    }
}
