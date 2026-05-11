import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import db from './db';

import type { CustomWebSocket, Room } from './types/types';

const PORT = 8080;
const wss = new WebSocketServer({ port: PORT });

const rooms: Record<string, Room> = {}; // In-memory storage for game rooms and their players

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
						players: [ws], // Add the host as the first player in the room
						host_ws: ws, // Store the host's WebSocket for later reference
						quizId: quizId,
						state: 'lobby',
						questions: [],
						questionIndex: 0
					};
					// TODO: Populate questions from db
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
						if(!/^[a-zA-Z0-9_]+$/.test(data.username)) {
							ws.close(1008, 'Username contains invalid characters');
							return;
						}
						if(rooms[data.gameId].state !== 'lobby') {
							ws.send(JSON.stringify({ type: 'error', message: 'Game has already started' }));
							return;
						}

						ws.username = data.username;
						ws.roomId = data.gameId;

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
						rooms[data.gameId].players.forEach(player => {
							if(player !== ws) {
								player.send(JSON.stringify({ type: 'player_joined', username: data.username }));
							}
						});
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
						rooms[ws.roomId].players.forEach(player => {
							player.send(JSON.stringify({ type: 'player_left', username: data.username }));
						});
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
					rooms[ws.roomId].players.forEach(player => {
						player.send(JSON.stringify({ type: 'game_start' }));
					});
					handleGameLogic(rooms[ws.roomId]); // Start the game logic
					break;
				case 'submit_answer':
					console.log(`User ${ws.user?.id} answered:`, data.answer);
					break;
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
				rooms[ws.roomId].players.forEach(player => {
					player.send(JSON.stringify({ type: 'game_ended', message: 'Host has left the lobby.' }));
				});
			}
			if(rooms[ws.roomId].state === 'in-game') {
				rooms[ws.roomId].state = 'finished';
			} else {
				delete rooms[ws.roomId];
			}
		}
		if (ws.roomId && rooms[ws.roomId]) {
			rooms[ws.roomId].players = rooms[ws.roomId].players.filter(player => player !== ws);
			rooms[ws.roomId].players.forEach(player => {
				player.send(JSON.stringify({ type: 'player_left', username: ws.username }));
			});
		}
	});
});

console.log(`WebSocket server is running on ws://localhost:${PORT}`);


/* ========= */
/* GAME LOOP */
/* ========= */

const handleGameLogic = async (room: Room) => {
	if(!room || room.state !== 'in-game') throw new Error('Invalid room state for game logic');

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
	} catch (err) {
		console.error('Error fetching questions and answers:', err);
		return;
	}

	sendNextQuestion(room);
}

const sendNextQuestion = (room: Room) => {
	const question = room.questions[room.questionIndex];
	console.log(`Sending question ${room.questionIndex + 1}: ${question.question_text}`);
	room.questionIndex++;
	room.players.forEach(player => {
		player.send(JSON.stringify({ type: 'next_question' }));

		const strippedQuestion: any = {
			question_text: question.question_text,
			question_type: question.question_type
		};
		const strippedAnswers = question.answers?.map((a: any) => ({ id: a.id, answer_text: a.answer_text }));
		if (question.time_limit !== null) {
			strippedQuestion.time_limit = question.time_limit;
		}
		setTimeout(() => {
			player.send(JSON.stringify({ 
				type: 'question',
				question: strippedQuestion
			}));
		}, 3000);
		setTimeout(() => {
			player.send(JSON.stringify({ 
				type: 'answers',
				answers: strippedAnswers
			}));
		}, 6000);
	})
}