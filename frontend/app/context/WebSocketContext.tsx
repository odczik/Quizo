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
    const wsUrl = import.meta.env.VITE_WS_URL;

    const params = useParams(); // Get game ID from URL if needed for connection

    const connect = () => {
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            console.log('Connected to Game Server');
            setIsConnected(true);
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setLastMessage({ ...data }); // Create a new object to ensure re-render
        };

        ws.onclose = (e) => {
            console.log('Connection closed', e);
            setIsConnected(false);

            // Try to reconnect after a short delay
            setTimeout(() => {
                if (!socketRef.current || socketRef.current.readyState === WebSocket.CLOSED) {
                    console.log('Attempting to reconnect to Game Server...');
                    connect();
                }
            }, 1000);
        };

        socketRef.current = ws;
    }

    useEffect(() => {
        connect();

        // Cleanup: Close the connection when the Provider unmounts
        return () => {
            socketRef.current?.close();
        };
    }, []); // Removing socketRef.current from dependencies because it causes infinite reconnect loops!

    // Helper function to send messages easily from anywhere
    const sendMessage = (type: string, payload: any = {}) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ ...payload, type }));
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