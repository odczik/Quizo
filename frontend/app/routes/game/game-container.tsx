import { useState, useEffect } from "react";

import { useGameSocket } from "~/context/WebSocketContext";
import { useNotification } from "~/context/NotificationContext";

import Lobby from "./lobby";
import Game from "./game";

export default function GameContainer({ params }: { params: { id?: string } }) {
    const { sendMessage, lastMessage, isConnected } = useGameSocket();
    const { notify } = useNotification();

    const [gameState, setGameState] = useState("lobby"); // lobby, in-game, finished

    useEffect(() => {
        if (lastMessage) {
            console.log('Received message in GameContainer:', lastMessage);
            switch (lastMessage.type) {
                case "game_start":
                    console.log('Game started!');
                    setGameState("in-game");
                    break;
                case 'player_left':
                    console.log('Player left:', lastMessage.username);
                    notify(`${lastMessage.username} has left the game.`, "warning");
                    break;
                default:
                    break;
            }
        }
    }, [lastMessage]);

    switch (gameState) {
        case "lobby":
            return <Lobby params={params} />;
        case "in-game":
            return <Game />;
        case "finished":
            return <div className="h-screen flex items-center justify-center"><h1 className="text-4xl font-bold">Game Over!</h1></div>;
        default:
            return null;
    }
}