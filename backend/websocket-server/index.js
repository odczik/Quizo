const { WebSocketServer } = require('ws');
const jwt = require('jsonwebtoken');
const db = require('./db');

const PORT = 8080;
const wss = new WebSocketServer({ port: PORT });

const rooms = {
	"123123": {
		players: []
	}
}; // In-memory storage for game rooms and their players

wss.on('connection', (ws) => {
    ws.isAuthenticated = false; // Mark as unauthenticated initially
	ws.canAuthenticate = true; // Allow them to authenticate for a short window

    // Set a timeout: If they don't authenticate within 3 seconds
    const authTimeout = setTimeout(() => {
        if (!ws.isAuthenticated) {
            // ws.terminate('Authentication timeout');
			ws.canAuthenticate = false; // They can no longer authenticate
        }
    }, 3000);

    ws.on('message', (message) => {
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
						rooms[data.gameId].players.push(ws);
						ws.send(JSON.stringify({ type: 'game_joined', gameId: data.gameId }));
						console.log(rooms)
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
});

console.log(`WebSocket server is running on ws://localhost:${PORT}`);