<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

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

    public function likes(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'quiz_likes')
            ->withPivot('liked_at');
    }

    /**
     * Get the image URL. Converts relative storage paths to full URLs.
     */
    protected function image(): \Illuminate\Database\Eloquent\Casts\Attribute
    {
        return \Illuminate\Database\Eloquent\Casts\Attribute::make(
            get: function ($value) {
                if (!$value) {
                    return null;
                }
                // If it's already a full URL (http, https, or data URL), return as-is
                if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://') || str_starts_with($value, 'data:')) {
                    return $value;
                }
                // Otherwise, it's a relative storage path, convert to public URL
                return '/storage/' . $value;
            }
        );
    }
}
