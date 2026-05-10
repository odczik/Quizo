import { useState } from "react";
import Lobby from "./lobby";
import Game from "./game";

export default function GameContainer() {
    const [gameState, setGameState] = useState("lobby"); // lobby, in-game, finished

    switch (gameState) {
        case "lobby":
            return <Lobby />;
        case "in-game":
            return <Game />;
        case "finished":
            return <div className="h-screen flex items-center justify-center"><h1 className="text-4xl font-bold">Game Over!</h1></div>;
        default:
            return null;
    }
}