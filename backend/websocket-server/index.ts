import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import db from './db';
import { sendToPlayers, executeForEachPlayer } from './util/util';

import type { CustomWebSocket, Room } from './types/types';

const PORT = 8080;
const wss = new WebSocketServer({ port: PORT });

const rooms: Record<string, Room> = {}; // In-memory storage for game rooms and their players

setInterval(() => {
	console.log(rooms)
}, 1000)

wss.on('connection', (ws: CustomWebSocket) => {
    ws.isAuthenticated = false; // Mark as unauthenticated initially
	ws.canAuthenticate = true; // Allow them to authenticate for a short window

    // Set a timeout: If they don't authenticate within 3 seconds
    const authTimeout = setTimeout(() => {
        if (!ws.isAuthenticated) {
            // ws.terminate('Authentication timeout');
			ws.canAuthenticate = false; // They can no longer authenticate
        }
    }, 3000);

    ws.on('message', (message: string) => {
        try {
            const data = JSON.parse(message);
			console.log('> ', data);

			// Handle different message types
			switch (data.type) {
				case 'authenticate':
					if (!ws.canAuthenticate) {
						ws.close(1008, 'Authentication window expired');
						return;
					}
					try {
						const decoded = jwt.verify(data.token, 'your-secret');
						ws.isAuthenticated = true;
						ws.user = decoded; // Store user info on the socket
						clearTimeout(authTimeout); // They are verified, cancel the kick out
						
						console.log(`User ${ws.user.id} matched and secured.`);
						ws.send(JSON.stringify({ type: 'authenticated', success: true }));
					} catch (err) {
						ws.close(1008, 'Invalid Token'); 
					}
					break;
				case 'create_game':
					// if (!ws.isAuthenticated) {
					// 	ws.close(1008, 'Authentication required');
					// 	return;
					// }

					ws.isHost = true; // Mark this socket as a host for later reference

					const quizId = data.quizId;
					let gameId;
					do {
						gameId = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a random 6-digit game ID
					} while (rooms[gameId]); // Ensure it's unique

					ws.roomId = gameId; // Store the room ID on the socket for cleanup later

					rooms[gameId] = {
						players: [], // Add the host as the first player in the room
						host_ws: ws, // Store the host's WebSocket for later reference
						quizId: quizId,
						default_time_limit: 20, // Default value, will be updated when the game starts
						state: 'lobby',
						questions: [],
						questionIndex: 0,
						players_answered: 0,
						timeouts: []
					};

					ws.send(JSON.stringify({ type: 'game_created', gameId: gameId }));
					break;
				case 'find_game':
					if(rooms[data.gameId]) {
						if(rooms[data.gameId].state !== 'lobby') {
							ws.send(JSON.stringify({ type: 'error', message: 'Game has already started' }));
							return;
						}
						ws.send(JSON.stringify({ type: 'game_found', gameId: data.gameId }));
					} else {
						ws.send(JSON.stringify({ type: 'error', message: 'Game not found' }));
						return;
					}
					break;
				case 'join_game':
					if(rooms[data.gameId]) {
						// Store username and room info on the socket for easy access later
						if(data.username.length > 20) {
							ws.close(1008, 'Username too long');
							return;
						}
						if(!/^[a-zA-Z0-9_ -]+$/.test(data.username)) {
							ws.send(JSON.stringify({ type: 'error', message: 'Username contains invalid characters. Only alphanumeric and spaces, hyphens and underscores allowed.' }));
							return;
						}
						if(rooms[data.gameId].state !== 'lobby') {
							ws.send(JSON.stringify({ type: 'error', message: 'Game has already started' }));
							return;
						}

						ws.username = data.username;
						ws.roomId = data.gameId;
						ws.points = 0;

						// Add player to the room if username is available
						if(rooms[data.gameId].players.some(p => p.username === data.username)) {
							ws.send(JSON.stringify({ type: 'error', message: 'Username already taken in this room' }));
							return;
						} else {
							rooms[data.gameId].players.push(ws);
						}

						// Notify the joining player that they successfully joined
						ws.send(JSON.stringify({ 
							type: 'game_joined', 
							gameId: data.gameId, 
							players: rooms[data.gameId].players.map(p => p.username) 
						}));
						
						// Notify other players in the room that a new player has joined
						sendToPlayers(rooms[data.gameId], { type: 'player_joined', username: data.username }, { exclude: ws });
					} else {
						ws.send(JSON.stringify({ type: 'error', message: 'Game not found' }));
						return;
					}
					break;
				case 'kick_player':
					if (!ws.isHost || !ws.roomId || !rooms[ws.roomId]) {
						ws.send(JSON.stringify({ type: 'error', message: 'Only the host can kick players' }));
						return;
					}
					const playerToKick = rooms[ws.roomId].players.find(p => p.username === data.username);
					if (playerToKick) {
						playerToKick.send(JSON.stringify({ type: 'kicked', message: 'You have been kicked from the game.' }));
						rooms[ws.roomId].players = rooms[ws.roomId].players.filter(p => p !== playerToKick);
						sendToPlayers(rooms[ws.roomId], { type: 'player_left', username: data.username });
					} else {
						ws.send(JSON.stringify({ type: 'error', message: 'Player not found in the game' }));
						return;
					}
					break;
				case 'start_game':
					if (!ws.isHost || !ws.roomId || !rooms[ws.roomId]) {
						ws.send(JSON.stringify({ type: 'error', message: 'Only the host can start the game' }));
						return;
					}
					if(rooms[ws.roomId].players.length === 0) {
						ws.send(JSON.stringify({ type: 'error', message: 'At least one player is required to start the game' }));
						return;
					}
					rooms[ws.roomId].state = 'in-game';
					sendToPlayers(rooms[ws.roomId], { type: 'game_start' });
					handleGameLogic(rooms[ws.roomId]); // Start the game logic
					break;
				case 'submit_answer':
					if (!ws.roomId || !rooms[ws.roomId]) return;

					console.log(`Received answer from ${ws.username}:`, data);
					const timeTaken = new Date().getTime() - (rooms[ws.roomId].question_time?.getTime() || 0);

					rooms[ws.roomId].players_answered = (rooms[ws.roomId].players_answered || 0) + 1;

					// Validate the answer
					const currentQuestion = rooms[ws.roomId].questions[rooms[ws.roomId].questionIndex - 1];
					const selectedAnswer = currentQuestion.answers?.find(a => a.id === data.answerId);

					if (selectedAnswer && selectedAnswer.is_correct) {
						// Simple scoring: More points for faster answers
						const maxPoints = 1000;
						const totalTimeMs = rooms[ws.roomId].default_time_limit * 1000;

						// Calculate percentage of time remaining (0.0 to 1.0)
						const timeFraction = Math.max(0, 1 - (timeTaken / totalTimeMs));

						// Award points based on speed
						const pointsEarned = Math.round(maxPoints * timeFraction);

						ws.points = (ws.points || 0) + pointsEarned;
						ws.aquiredPoints = pointsEarned;
						ws.was_correct = true;
					} else {
						ws.was_correct = false;
					}

					if(rooms[ws.roomId].players_answered === rooms[ws.roomId].players.length) {
						updatePlayerScores(rooms[ws.roomId]);
					}
					break;
				case 'skip_question':
					if (!ws.isHost || !ws.roomId || !rooms[ws.roomId]) {
						ws.send(JSON.stringify({ type: 'error', message: 'Only the host can skip questions' }));
						return;
					}
					updatePlayerScores(rooms[ws.roomId]);
					break;
				case 'next_question':
					if (!ws.isHost || !ws.roomId || !rooms[ws.roomId]) {
						ws.send(JSON.stringify({ type: 'error', message: 'Only the host can move to the next question' }));
						return;
					}
					if(rooms[ws.roomId].questionIndex >= rooms[ws.roomId].questions.length) {
						// No more questions, end the game
						gameFinished(rooms[ws.roomId]);
						return;
					} else {
						sendNextQuestion(rooms[ws.roomId]);
					}
				default:
					console.log('Unknown message type:', data.type);
					break;
			}
        } catch (e) {
			console.error('Error processing message:', e);
            ws.close(1007, 'Invalid message format');
        }
    });

	ws.on('close', () => {
		console.log('Client disconnected');
		// Clean up
		if (ws.isHost && ws.roomId && rooms[ws.roomId]) {
			// If the host leaves, end the game (if already started, else just delete the lobby)
			if (rooms[ws.roomId].players.length > 0) {
				sendToPlayers(rooms[ws.roomId], { type: 'game_ended', message: 'Host has left the game. The game has ended.' }, { excludeHost: true });
			}
			if(rooms[ws.roomId].state === 'in-game') {
				gameFinished(rooms[ws.roomId]);
			} else {
				delete rooms[ws.roomId];
			}
		}
		if (ws.roomId && rooms[ws.roomId] && ws !== rooms[ws.roomId].host_ws) {
			rooms[ws.roomId].players = rooms[ws.roomId].players.filter(player => player !== ws);
			sendToPlayers(rooms[ws.roomId], { type: 'player_left', username: ws.username });
		}
	});
});

console.log(`WebSocket server is running on ws://localhost:${PORT}`);


/* ========= */
/* GAME LOOP */
/* ========= */

const handleGameLogic = async (room: Room) => {
	if(!room || room.state !== 'in-game') throw new Error('Invalid room state for game logic');

	await loadQuestionsIntoMemory(room);

	sendNextQuestion(room);
}

const loadQuestionsIntoMemory = async (room: Room) => {
	try {
		// Fetch questions using Kysely
		const questions = await db
			.selectFrom('questions')
			.selectAll()
			.where('quiz_id', '=', room.quizId)
			.execute();

		if (questions.length === 0) {
			console.log('No questions found for this quiz.');
			return;
		}

		const questionIds = questions.map((q: any) => q.id);

		// Fetch answers for these questions
		const answers = await db
			.selectFrom('answers')
			.selectAll()
			.where('question_id', 'in', questionIds)
			.execute();

		// Attach the corresponding answers strictly to each question
		room.questions = questions.map((q: any) => ({
			...q,
			answers: answers.filter((a: any) => a.question_id === q.id)
		}));

		const defaultTimeLimit = await db
			.selectFrom('quizzes')
			.select('default_time_limit')
			.where('id', '=', room.quizId)
			.executeTakeFirst();

		room.default_time_limit = defaultTimeLimit?.default_time_limit || 20;
	} catch (err) {
		console.error('Error fetching questions and answers:', err);
		return;
	}

	// sendToPlayers(room, { type: 'questions_loaded', totalQuestions: room.questions.length });
}

const sendNextQuestion = (room: Room) => {
	const question = room.questions[room.questionIndex];
	console.log(`Sending question ${room.questionIndex + 1}: ${question.question_text}`);
	room.questionIndex++;

	const strippedQuestion: any = {
		question_text: question.question_text,
		question_type: question.question_type,
		question_index: room.questionIndex,
		questions_length: room.questions.length
	};
	const strippedAnswers = question.answers?.map((a: any) => ({ id: a.id, answer_text: a.answer_text }));
	if (question.time_limit !== null) {
		strippedQuestion.time_limit = question.time_limit;
	}

	executeForEachPlayer(room, (player) => {
		player.send(JSON.stringify({ type: 'next_question' }));
	});

	const t1 = setTimeout(() => {
		executeForEachPlayer(room, (player) => {
			player.send(JSON.stringify({ 
				type: 'question',
				question: strippedQuestion
			}));
		});
	}, 3000);

	const t2 = setTimeout(() => {
		if(!room.question_time) room.question_time = new Date(); // Mark the time when the question was sent for point calculation later
		executeForEachPlayer(room, (player) => {
			player.send(JSON.stringify({ 
				type: 'answers',
				answers: strippedAnswers
			}));
		});
	}, 6000);

	room.timeouts.push(t1, t2);
}
const updatePlayerScores = (room: Room) => {
	if (room.timeouts) {
		room.timeouts.forEach(clearTimeout);
	}
	room.timeouts = [];

	room.host_ws?.send(JSON.stringify({
		type: 'update_scores',
		players: room.players.map(p => ({ username: p.username, points: p.points, aquiredPoints: p.aquiredPoints }))
	}));

	executeForEachPlayer(room, (player) => {
		player.send(JSON.stringify({ 
			type: 'answer_result',
			correct: player.was_correct,
			points: player.aquiredPoints
		}));
		player.aquiredPoints = 0;
		player.was_correct = null;
	}, { excludeHost: true });

	room.players_answered = 0;
	room.question_time = undefined;
}

const gameFinished = (room: Room) => {
	if (room.timeouts) {
		room.timeouts.forEach(clearTimeout);
		room.timeouts = [];
	}

	room.state = 'finished';

	const finalScores = room.players.map(p => ({ username: p.username, points: p.points }));
	room.host_ws?.send(JSON.stringify({ type: 'game_finished', finalScores }));

	room.players.forEach(player => {
		player.send(JSON.stringify({ type: 'game_finished', placement: finalScores.findIndex(fs => fs.username === player.username) + 1, score: player.points }));
	});

	if (room.host_ws?.roomId) {
		delete rooms[room.host_ws.roomId];
	}
}