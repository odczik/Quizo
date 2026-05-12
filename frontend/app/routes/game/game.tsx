import { useEffect, useState } from "react";
import { useGameSocket } from "~/context/WebSocketContext";
import { useNotification } from "~/context/NotificationContext";
import { useMatches } from "react-router";

import { AnswerButton } from "~/components/AnswerButton";
import { Spinner } from "~/components/Spinner";

export default function Game() {
    const { sendMessage, lastMessage, isConnected } = useGameSocket();
    const { notify } = useNotification();
    const matches = useMatches();

    const [gameState, setGameState] = useState<'get-ready' | 'in-progress' | 'finished'>('get-ready');
    const [counter, setCounter] = useState(3);
    const [question, setQuestion] = useState<any | null>(null);
    const [answers, setAnswers] = useState<any | null>(null);
    const [isHost] = useState(matches[matches.length - 1].id === "host-lobby");

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
                <div className="flex flex-col h-screen w-full">
                    {/* Upper 2/3: Question */}
                    <div className="flex-1 flex items-center justify-center p-4">
                        <h1 className="text-4xl md:text-6xl font-bold text-center">{question.question_text}</h1>
                    </div>
                    {/* Lower 1/3: Answers */}
                    <div className="h-1/3 min-h-[33vh] w-full p-4 pb-8">
                        {answers && !isHost && (
                            <div className="w-full h-full grid grid-cols-2 gap-4">
                                {answers.map((answer: any, index: number) => (
                                    <AnswerButton 
                                        key={answer.id} 
                                        color={index + 1}
                                        text={answer.answer_text} 
                                        className="h-full w-full rounded-md font-bold text-xl md:text-2xl shadow-sm transition-transform active:scale-[0.98]"
                                        onClick={() => {
                                            sendMessage("submit_answer", { answerId: answer.id });
                                        }} 
                                    />
                                ))}
                            </div>
                        )}
                    </div>
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