import type { Route } from "./+types/game";
import { useEffect } from "react";
import { Button } from "~/components/Button";
import { useGameSocket } from "~/context/WebSocketContext";

export default function Game({ params }: Route.ComponentProps) {
    const { sendMessage, lastMessage, isConnected } = useGameSocket();

    // Listen for incoming messages specific to this component
    useEffect(() => {
        if (lastMessage?.type === 'game_over') {
            alert('The game is finished!');
        }
    }, [lastMessage]);

    const handleAnswer = (answerId: number) => {
        sendMessage('submit_answer', { answerId });
    };

    if (!isConnected) return <div>Reconnecting to server...</div>;

    return (
        <div>
            <Button onClick={() => handleAnswer(1)}>Red Triangle</Button>
            <Button onClick={() => handleAnswer(2)}>Blue Diamond</Button>
        </div>
    );
}