import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import db from './db';
import type { CustomWebSocket, Room } from './types/types';

const PORT = 8080;
const wss = new WebSocketServer({ port: PORT });

const rooms: Record<string, Room> = {
	"123123": {
		players: []
	}
}; // In-memory storage for game rooms and their players

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
						players: [],
						host_ws: ws, // Store the host's WebSocket for later reference
						state: 'lobby',
						questions: [],
						questionIndex: 0
					};
					// TODO: Populate questions from db
					ws.send(JSON.stringify({ type: 'game_created', gameId: gameId }));
					break;
				case 'find_game':
					if(rooms[data.gameId]) {
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
							ws.terminate(1008, 'Username too long');
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
						rooms[data.gameId].host_ws?.send(JSON.stringify({ type: 'player_joined', username: data.username }));
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
				case 'submit_answer':
					console.log(`User ${ws.user?.id} answered:`, data.answer);
					break;
				default:
					console.log('Unknown message type:', data.type);
					break;
			}
        } catch (e) {
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
					player.close();
				});
			}
			if(rooms[ws.roomId].state === 'in_game') {
				rooms[ws.roomId].state = 'finished';
			} else {
				delete rooms[ws.roomId];
			}
		}
		if (ws.roomId && rooms[ws.roomId]) {
			rooms[ws.roomId].players = rooms[ws.roomId].players.filter(player => player !== ws);
			rooms[ws.roomId].host_ws?.send(JSON.stringify({ type: 'player_left', username: ws.username }));
			rooms[ws.roomId].players.forEach(player => {
				player.send(JSON.stringify({ type: 'player_left', username: ws.username }));
			});
		}
	});
});

console.log(`WebSocket server is running on ws://localhost:${PORT}`);