import type { Generated } from 'kysely';

export interface Database {
	users: UserTable;
	quizzes: QuizTable;
	quiz_likes: QuizLikeTable;
	questions: QuestionTable;
	answers: AnswerTable;
}

export interface UserTable {
	// Generated means it is either auto-incrementing or has a default value
	id: Generated<number>;
	username: string;
	email: string;
	password_hash: string;
	// SQLite & MySQL often store dates as strings when using Kysely by default or timestamps
	created_at: Generated<string>; 
}

export interface QuizTable {
	id: Generated<number>;
	title: string;
	description: string | null;
	created_by: number;
	is_public: Generated<boolean>;
	default_time_limit: Generated<number>;
	created_at: Generated<string>;
}

export interface QuizLikeTable {
	user_id: number;
	quiz_id: number;
}

export interface QuestionTable {
	id: Generated<number>;
	quiz_id: number;
	question_text: string;
	// Future proofing default "multiple_choice"
	question_type: Generated<string>;
	time_limit: number | null;
	order_index: number;
}

export interface AnswerTable {
	id: Generated<number>;
	question_id: number;
	answer_text: string;
	is_correct: Generated<boolean>;
}
