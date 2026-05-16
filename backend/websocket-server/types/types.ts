import { WebSocket } from 'ws';

export interface CustomWebSocket extends WebSocket {
    isAuthenticated?: boolean;
    canAuthenticate?: boolean;
    isHost?: boolean;
    user?: any;
    username?: string;
    roomId?: string;
    points?: number;
    aquiredPoints?: number;
    was_correct?: boolean | null;
}

export interface Question {
	id: number;
	quiz_id: number;
	question_text: string;
	question_type: string;
	time_limit: number | null;
	order_index: number;
    answers?: Answer[];
}

export interface Answer {
	id: number;
	question_id: number;
	answer_text: string;
	is_correct: boolean;
}

export interface Room {
    players: CustomWebSocket[];
    host_ws?: CustomWebSocket;
    quizId: number;
    default_time_limit: number;
	state: 'lobby' | 'in-game' | 'finished';
	questions: Question[];
    questionIndex: number;
    question_time?: Date;
    players_answered?: number;
    timeouts?: ReturnType<typeof setTimeout>[];
}