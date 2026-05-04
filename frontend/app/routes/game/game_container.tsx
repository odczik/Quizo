import type { Route } from "./+types/game_container";
import { WebSocketProvider } from "~/context/WebSocketContext";
import Game from "./game";

export default function GameContainer({ params }: Route.ComponentProps) {
    return (
        <WebSocketProvider>
            <Game params={params} />
        </WebSocketProvider>
    );
}
