const WebSocket = require('ws');

const PORT = 8080;

const server = new WebSocket.Server({ port: PORT });

server.on('connection', (ws) => {
	console.log('Client connected');

	ws.on('message', (message) => {
		console.log(`Received: ${message}`);
		
		// Broadcast to all clients
		server.clients.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(message);
			}
		});
	});

	ws.on('close', () => {
		console.log('Client disconnected');
	});

	ws.on('error', (error) => {
		console.error('WebSocket error:', error);
	});
});

console.log('WebSocket server listening on ws://localhost:' + PORT);
