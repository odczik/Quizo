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
            $table->text('image')->nullable();
        });

        // Update question_type to allow fill_in_blank.
        // SQLite doesn't support enum alters, so we recreate the questions table in that case.
        if (Schema::getConnection()->getDriverName() === 'sqlite') {
            DB::statement('PRAGMA foreign_keys=off');

            Schema::create('questions_temp', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('quiz_id');
                $table->text('question_text');
                $table->string('question_type')->default('multiple_choice');
                $table->integer('time_limit')->nullable();
                $table->integer('order_index');
                $table->timestamps();
                $table->foreign('quiz_id')->references('id')->on('quizzes')->onDelete('cascade');
            });

            DB::statement('INSERT INTO questions_temp (id, quiz_id, question_text, question_type, time_limit, order_index, created_at, updated_at) SELECT id, quiz_id, question_text, question_type, time_limit, order_index, created_at, updated_at FROM questions');
            Schema::drop('questions');
            Schema::rename('questions_temp', 'questions');

            DB::statement('PRAGMA foreign_keys=on');
        } else {
            DB::statement("ALTER TABLE questions MODIFY COLUMN question_type ENUM('multiple_choice','true_false','fill_in_blank') DEFAULT 'multiple_choice'");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('quizzes', function (Blueprint $table) {
            $table->dropColumn('image');
        });

        if (Schema::getConnection()->getDriverName() === 'sqlite') {
            DB::statement('PRAGMA foreign_keys=off');

            Schema::create('questions_temp', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('quiz_id');
                $table->text('question_text');
                $table->string('question_type')->default('multiple_choice');
                $table->integer('time_limit')->nullable();
                $table->integer('order_index');
                $table->timestamps();
                $table->foreign('quiz_id')->references('id')->on('quizzes')->onDelete('cascade');
            });

            DB::statement('INSERT INTO questions_temp (id, quiz_id, question_text, question_type, time_limit, order_index, created_at, updated_at) SELECT id, quiz_id, question_text, question_type, time_limit, order_index, created_at, updated_at FROM questions');
            Schema::drop('questions');
            Schema::rename('questions_temp', 'questions');

            DB::statement('PRAGMA foreign_keys=on');
        } else {
            DB::statement("ALTER TABLE questions MODIFY COLUMN question_type ENUM('multiple_choice','true_false') DEFAULT 'multiple_choice'");
        }
    }
};
