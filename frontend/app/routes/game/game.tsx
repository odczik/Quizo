import { useEffect, useState } from "react";
import { useGameSocket } from "~/context/WebSocketContext";
import { useNotification } from "~/context/NotificationContext";
import { useMatches } from "react-router";

import { AnswerButton } from "~/components/AnswerButton";
import { Spinner } from "~/components/Spinner";
import { Button } from "~/components/Button";
import { ProgressBar } from "~/components/ProgressBar";

export default function Game() {
    const { sendMessage, lastMessage, isConnected } = useGameSocket();
    const { notify } = useNotification();
    const matches = useMatches();

    const [gameState, setGameState] = useState<'get-ready' | 'in-progress' | 'finished'>('get-ready');
    const [counter, setCounter] = useState(3);
    const [question, setQuestion] = useState<any | null>(null);
    const [answers, setAnswers] = useState<any | null>(null);
    const [answered, setAnswered] = useState(false);
    const [isHost] = useState(matches[matches.length - 1].id === "host-lobby");
    const [results, setResults] = useState<any | null>(null);
    const [answerTimer, setAnswerTimer] = useState<number>(100);

    useEffect(() => {
        let activeInterval: ReturnType<typeof setInterval>;

        if (lastMessage) {
            switch (lastMessage.type) {
                case "next_question":
                    setGameState('get-ready');
                    setCounter(3);
                    setQuestion(null);
                    setAnswers(null);
                    setAnswered(false);
                    setResults(null);
                    setAnswerTimer(100);
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

                    const duration = 3000;
                    const startTime = Date.now();

                    activeInterval = setInterval(() => {
                        const elapsed = Date.now() - startTime;
                        const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
                        
                        setAnswerTimer(remaining);

                        if (remaining <= 0) {
                            clearInterval(activeInterval);
                        }
                    }, 100); // 100ms interval plays much nicer with CSS transition-duration-300

                    break;
                case "answers":
                    setAnswers(lastMessage.answers);
                    console.log("Received answers:", lastMessage.answers);
                    break;
                case 'player_left':
                    console.log('Player left:', lastMessage.username);
                    notify(`${lastMessage.username} has left the game.`, "warning");
                    break;
                case 'answer_result':
                    setResults(lastMessage);
                    break;
                case 'update_scores':
                    setResults(lastMessage);
                    break;
                default:
                    console.log(lastMessage);
                    break;
            }
        }
        
        return () => {
            if (activeInterval) clearInterval(activeInterval);
        };
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
                    {answered ? (
                        results ? (
                            <div>
                                {results.correct ? (
                                    <div className="flex-1 flex items-center justify-center text-green-600">
                                        Correct! +{results.points} points
                                    </div>
                                ) : (
                                    <div className="flex-1 flex items-center justify-center text-red-600">
                                        Incorrect!
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center">
                                Waiting for the next question... <Spinner className="ml-4" />
                            </div>
                        )
                    ) : (
                        results ? (
                            <div>
                                {results.players && results.players.map((player: any) => (
                                    <div key={player.username} className="flex items-center justify-between p-4 border-b">
                                        <span>{player.username}</span>
                                        <span>{player.points} points {player.aquiredPoints > 0 && `( +${player.aquiredPoints} )`}</span>
                                    </div>
                                ))}
                                <div className="flex justify-center mt-4">
                                    <Button 
                                        variant="primary" 
                                        onClick={() => sendMessage("next_question")}
                                    >
                                        Next Question
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <>
                            <div className="flex-1 flex items-center justify-center p-4">
                                <h1 className="text-4xl md:text-6xl font-bold text-center">{question ? question.question_text : <Spinner />}</h1>
                            </div>

                            {isHost && (
                                <div className="flex justify-center mb-4">
                                    <Button 
                                        variant="primary" 
                                        onClick={() => sendMessage("skip_question")}
                                    >
                                        Next Question
                                    </Button>
                                </div>
                            )}
                            
                            <div className="h-1/3 min-h-[33vh] w-full p-4 pb-8">
                                {answers ? (
                                    <div className="w-full h-full grid grid-cols-2 gap-4">
                                        {answers.map((answer: any, index: number) => (
                                            <AnswerButton 
                                                key={answer.id} 
                                                color={index + 1}
                                                text={answer.answer_text} 
                                                className="h-full w-full rounded-md font-bold text-xl md:text-2xl shadow-sm transition-transform active:scale-[0.98]"
                                                onClick={() => {
                                                    sendMessage("submit_answer", { answerId: answer.id });
                                                    setAnswered(true);
                                                }}
                                                disabled={isHost}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <ProgressBar progress={answerTimer} color="white" className="w-full, !bg-transparent" />
                                )}
                            </div>
                            </>
                        )
                    )}
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