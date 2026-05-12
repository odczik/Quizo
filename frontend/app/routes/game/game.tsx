import { useEffect, useState } from "react";
import { useGameSocket } from "~/context/WebSocketContext";
import { useNotification } from "~/context/NotificationContext";

export default function Game() {
    const { sendMessage, lastMessage, isConnected } = useGameSocket();
    const { notify } = useNotification();

    const [gameState, setGameState] = useState<'get-ready' | 'in-progress' | 'finished'>('get-ready');
    const [counter, setCounter] = useState(3);
    const [question, setQuestion] = useState<any | null>(null);
    const [answers, setAnswers] = useState<any | null>(null);

    useEffect(() => {
        if (lastMessage) {
            switch (lastMessage.type) {
                case "next_question":
                    setGameState('get-ready');
                    setCounter(3);
                    setQuestion(null);
                    setAnswers(null);
                    setTimeout(() => {
                        setCounter(2);
                        setTimeout(() => {
                            setCounter(1);
                            setTimeout(() => {
                                setGameState('in-progress');
                            }, 1000);
                        }, 1000);
                    }, 1000);
                    break;
                case "question":
                    setQuestion(lastMessage.question);
                    break;
                case "answers":
                    setAnswers(lastMessage.answers);
                    console.log("Received answers:", lastMessage.answers);
                    break;
                case 'player_left':
                    console.log('Player left:', lastMessage.username);
                    notify(`${lastMessage.username} has left the game.`, "warning");
                    break;
                default:
                    console.log(lastMessage);
                    break;
            }
        }
    }, [lastMessage]);

    switch (gameState) {
        case 'get-ready':
            return (
                <div className="flex items-center justify-center h-screen">
                    <h1 className="text-4xl font-bold">{counter}</h1>
                </div>
            );
        case 'in-progress':
            return (
                <div className="flex items-center justify-center h-screen">
                    <h1 className="text-4xl font-bold">{question.question_text}</h1>
                </div>
            );
        case 'finished':
            return (
                <div className="flex items-center justify-center h-screen">
                    <h1 className="text-4xl font-bold">Game Page</h1>
                </div>
            );
    }
}