const { WebSocketServer } = require('ws');
const jwt = require('jsonwebtoken');
const db = require('./db');

const PORT = 8080;

const wss = new WebSocketServer({ port: PORT });

wss.on('connection', (ws) => {
    ws.isAuthenticated = false; // Mark as unauthenticated initially

    // Set a timeout: If they don't authenticate within 3 seconds, terminate them
    const authTimeout = setTimeout(() => {
        if (!ws.isAuthenticated) {
            ws.terminate('Authentication timeout');
        }
    }, 3000);

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            // 1. Handle Authentication First
            if (!ws.isAuthenticated) {
                if (data.type === 'authenticate') {
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
                } else {
                    // They sent a normal game message before authenticating
                    ws.close(1008, 'Please authenticate first');
                }
                return;
            }

            // 2. Handle Normal Game Logic (Only runs if ws.isAuthenticated is true)
            if (data.type === 'submit_answer') {
                console.log(`User ${ws.user.id} answered:`, data.answer);
            }

        } catch (e) {
            ws.close(1007, 'Invalid message format');
        }
    });
});

console.log(`WebSocket server is running on ws://localhost:${PORT}`);