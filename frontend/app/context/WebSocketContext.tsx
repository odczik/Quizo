import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';

// Define the shape of our context
interface WebSocketContextType {
    socket: WebSocket | null;
    isConnected: boolean;
    sendMessage: (type: string, payload?: any) => void;
    lastMessage: any | null; // useful for components to react to new data
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
    // useRef keeps the socket instance across re-renders without causing re-renders
    const socketRef = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState<any>(null);

    const params = useParams(); // Get game ID from URL if needed for connection

    useEffect(() => {
        // Connect to your Node.js websocket server
        const ws = new WebSocket('ws://localhost:8080');

        ws.onopen = () => {
            console.log('Connected to Game Server');
            setIsConnected(true);
            
            if(params.id) {
                // If we have a game ID, we can send it immediately to find that game room
                ws.send(JSON.stringify({ type: 'find_game', gameId: params.id }));
            } else {
                const token = localStorage.getItem('auth_token');
                // const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWQiOiJ0ZXN0aWQiLCJhZG1pbiI6dHJ1ZSwiaWF0IjoxNTE2MjM5MDIyfQ.-HsQAb6O7Jko6P3B25IxIOS8k2Y5_Fm1fKhXhkpfSX8"
                if (token) {
                    ws.send(JSON.stringify({ type: 'authenticate', token }));
                }
            }
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setLastMessage(data); // Save it so components can react
        };

        ws.onclose = (e) => {
            console.log('Connection closed', e);
            setIsConnected(false);
            // Ideally, implement a reconnection timeout here
        };

        socketRef.current = ws;

        // Cleanup: Close the connection when the Provider unmounts
        return () => {
            ws.close();
        };
    }, []); // Empty dependency array = only runs once on mount!

    // Helper function to send messages easily from anywhere
    const sendMessage = (type: string, payload: any = {}) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ type, ...payload }));
        }
    };

    return (
        <WebSocketContext.Provider value={{ socket: socketRef.current, isConnected, sendMessage, lastMessage }}>
            {children}
        </WebSocketContext.Provider>
    );
}

// Custom Hook to use the WebSocket easily
export function useGameSocket() {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error("useGameSocket must be used within a WebSocketProvider");
    }
    return context;
}