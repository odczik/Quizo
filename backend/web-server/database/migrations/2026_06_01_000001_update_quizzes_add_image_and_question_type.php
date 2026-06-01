<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add image column to quizzes
        Schema::table('quizzes', function (Blueprint $table) {
            $table->text('image')->nullable()->after('description');
        });

        // Update question_type enum to include 'fill_in_blank'
        // Use raw statement to modify the enum type (works for MySQL).
        // If using a different DB, adjust accordingly.
        DB::statement("ALTER TABLE questions MODIFY COLUMN question_type ENUM('multiple_choice','true_false','fill_in_blank') DEFAULT 'multiple_choice'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('quizzes', function (Blueprint $table) {
            $table->dropColumn('image');
        });

        // Revert enum to original set without 'fill_in_blank'
        DB::statement("ALTER TABLE questions MODIFY COLUMN question_type ENUM('multiple_choice','true_false') DEFAULT 'multiple_choice'");
    }
};
