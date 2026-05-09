export interface CustomWebSocket extends WebSocket {
    isAuthenticated?: boolean;
    canAuthenticate?: boolean;
    user_id?: number;
    user?: any;
    username?: string;
    roomId?: string;
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
    host_id?: number;
	state: 'lobby' | 'in_game' | 'finished';
	questions: Question[];
    questionIndex: number;
}