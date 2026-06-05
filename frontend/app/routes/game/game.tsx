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
    const [counter, setCounter] = useState<number | null>(null);
    const [timer, setTimer] = useState(0);
    const [question, setQuestion] = useState<any | null>(null);
    const [answers, setAnswers] = useState<any | null>(null);
    const [answered, setAnswered] = useState(false);
    const [isHost] = useState(matches[matches.length - 1].id === "host-lobby");
    const [results, setResults] = useState<any | null>(null);
    const [questionStats, setQuestionStats] = useState<any | null>(null);
    const [answerTimer, setAnswerTimer] = useState<number>(100);
    const [finalScores, setFinalScores] = useState<any[] | null>(null);
    const [placement, setPlacement] = useState<number | null>(null);
    const [finalPoints, setFinalPoints] = useState<number | null>(null);

    useEffect(() => {
        let activeInterval: ReturnType<typeof setInterval>;
        let timerInterval: ReturnType<typeof setInterval> | null = null;

        if (lastMessage) {
            console.log(lastMessage);
            switch (lastMessage.type) {
                case "next_question":
                    setGameState('get-ready');
                    setCounter(3);
                    setTimer(0);
                    if (timerInterval) clearInterval(timerInterval);
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
                    setTimer(lastMessage.question.time_limit);

                    const duration = 3000;
                    const startTime = Date.now();

                    activeInterval = setInterval(() => {
                        const elapsed = Date.now() - startTime;
                        const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
                        
                        setAnswerTimer(remaining);

                        if (remaining <= 0) {
                            clearInterval(activeInterval);
                        }
                    }, 100); // 100ms interval plays much nicer with CSS transition-duration-

                    break;
                case "answers":
                    setAnswers(lastMessage.answers);

                    timerInterval = setInterval(() => {
                        setTimer(prev => {
                            if (prev > 0) return prev - 1;
                            if(timerInterval) clearInterval(timerInterval);
                            return 0;
                        });
                    }, 1000);

                    break;
                case 'answer_result':
                    setAnswered(true);
                    setResults(lastMessage);
                    break;
                case 'question_results':
                    setQuestionStats(lastMessage.answer_statistics);
                    break;
                case 'update_scores':
                    setResults(lastMessage);
                    break;
                case 'game_finished':
                    if(lastMessage.finalScores) {
                        setFinalScores(lastMessage.finalScores);
                    } else {
                        setPlacement(lastMessage.placement);
                        setFinalPoints(lastMessage.score);
                    }
                    setGameState('finished');
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
                    <h1 className="text-4xl font-bold">{counter !== null ? counter : 'Get Ready!'}</h1>
                </div>
            );
        case 'in-progress':
            return (
                <div className="relative flex flex-col h-screen w-full">
                    {question && (
                        <div className="absolute top-4 left-4 md:top-6 md:left-6 bg-black/20 backdrop-blur-md border border-white/10 text-white/90 font-bold text-lg md:text-2xl px-5 py-2 rounded-2xl drop-shadow-md z-50 pointer-events-none">
                            {question.question_index} / {question.questions_length}
                        </div>
                    )}
                    {answered ? (
                        results ? (
                            <div className="flex-1 flex flex-col items-center justify-center w-full h-full">
                                {results.correct ? (
                                    <div className="flex flex-col items-center justify-center text-white font-bold text-4xl md:text-6xl drop-shadow-md space-y-6">
                                        <svg className="w-24 h-24 md:w-32 md:h-32 text-green-500 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Correct!</span>
                                        <span className="text-2xl md:text-3xl bg-black/20 px-6 py-3 rounded-full shadow-inner">
                                            +{results.points} points
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-white font-bold text-4xl md:text-6xl drop-shadow-md space-y-6">
                                        <svg className="w-24 h-24 md:w-32 md:h-32 text-red-500 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        <span>Incorrect!</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center">
                                Waiting for other players... <Spinner className="ml-4" />
                            </div>
                        )
                    ) : (
                        results ? (
                            <div className="flex-1 flex flex-col items-center justify-center w-full p-4 overflow-y-auto">
                                <div className="w-full max-w-3xl bg-black/30 backdrop-blur-lg rounded-3xl shadow-2xl p-6 md:p-8 flex flex-col space-y-6 my-auto border border-white/10">
                                    <h2 className="text-3xl md:text-5xl font-bold text-center text-white drop-shadow-md mb-6">
                                        Leaderboard
                                    </h2>
                                    <div className="flex flex-col space-y-3">
                                        {results.players && [...results.players].sort((a: any, b: any) => b.points - a.points).map((player: any, index: number) => (
                                            <div 
                                                key={player.username} 
                                                className="flex items-center justify-between p-4 rounded-xl bg-white/10 shadow-sm border border-white/5"
                                            >
                                                <div className="flex items-center space-x-4 md:space-x-6">
                                                    <span className="font-bold text-xl md:text-2xl text-white/50 w-8 text-right">
                                                        {index + 1}
                                                    </span>
                                                    <span className="font-bold text-xl md:text-2xl text-white drop-shadow-sm">
                                                        {player.username}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-4">
                                                    {player.aquiredPoints > 0 && (
                                                        <span className="text-sm md:text-base font-bold text-green-300 bg-black/40 px-3 py-1 rounded-full border border-white/5 shadow-inner">
                                                            +{player.aquiredPoints}
                                                        </span>
                                                    )}
                                                    <span className="font-bold text-2xl md:text-3xl text-white drop-shadow-sm min-w-[3rem] text-right">
                                                        {player.points}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {isHost && (
                                        <div className="flex justify-center mt-6 pt-4">
                                            <Button 
                                                variant="primary" 
                                                className="text-lg px-8 py-3 shadow-lg"
                                                onClick={() => sendMessage("next_question")}
                                            >
                                                Next Question
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            questionStats ? (
                                <div className="flex-1 flex flex-col items-center justify-center w-full p-4">
                                    <h2 className="text-3xl md:text-5xl font-bold text-center text-white drop-shadow-md mb-6">
                                        Question Results
                                    </h2>
                                    <div className="flex justify-center mt-6 pt-4">
                                        <Button 
                                            variant="primary" 
                                            className="text-lg px-8 py-3 shadow-lg"
                                            onClick={() => sendMessage("update_scores")}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                <div className="flex-1 flex items-center justify-center p-4">
                                    <h1 className="text-4xl md:text-6xl font-bold text-center">{answers && timer}</h1>
                                </div>

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
                        )
                    )}
                </div>
            );
        case 'finished':
            return (
                <div className="flex flex-col items-center justify-center p-4 min-h-screen w-full">
                    {finalScores ? (
                        <div className="w-full max-w-3xl bg-black/30 backdrop-blur-lg rounded-3xl shadow-2xl p-6 md:p-8 flex flex-col space-y-6 my-auto border border-white/10">
                            <h2 className="text-4xl md:text-6xl font-bold text-center text-white drop-shadow-md mb-6">
                                Final Scores
                            </h2>
                            <div className="flex flex-col space-y-3">
                                {[...finalScores].sort((a: any, b: any) => b.points - a.points).map((player: any, index: number) => (
                                    <div 
                                        key={player.username} 
                                        className={`flex items-center justify-between p-4 rounded-xl shadow-sm border ${
                                            index === 0 ? 'bg-yellow-500/20 border-yellow-500/50 border-2' : 
                                            index === 1 ? 'bg-gray-300/20 border-gray-400/50 border-2' : 
                                            index === 2 ? 'bg-amber-700/30 border-amber-600/50 border-2' : 
                                            'bg-white/10 border-white/5'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-4 md:space-x-6">
                                            <span className={`font-bold text-2xl md:text-3xl w-8 text-right drop-shadow-sm ${
                                                index === 0 ? 'text-yellow-400' : 
                                                index === 1 ? 'text-gray-300' : 
                                                index === 2 ? 'text-amber-500' : 
                                                'text-white/70'
                                            }`}>
                                                {index + 1}
                                            </span>
                                            <span className={`font-bold text-2xl md:text-3xl drop-shadow-sm ${
                                                (index >= 0 && index < 3) ? 'text-white' : 
                                                'text-white/70'
                                            }`}>
                                                {player.username}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <span className={`font-bold text-3xl md:text-4xl drop-shadow-sm min-w-[3rem] text-right ${
                                                index === 0 ? 'text-yellow-400' : 
                                                index === 1 ? 'text-gray-300' : 
                                                index === 2 ? 'text-amber-500' : 
                                                'text-white/70'
                                            }`}>
                                                {player.points}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-500">
                            <h2 className="text-3xl md:text-5xl font-bold text-white/80 drop-shadow-md">
                                You placed
                            </h2>
                            <div className={`flex items-center justify-center w-40 h-40 md:w-56 md:h-56 backdrop-blur-md rounded-full shadow-2xl border-4 ${
                                placement === 1 ? 'bg-yellow-500/30 border-yellow-400 text-yellow-300' :
                                placement === 2 ? 'bg-gray-300/30 border-gray-300 text-gray-200' :
                                placement === 3 ? 'bg-amber-600/30 border-amber-600 text-amber-500' :
                                'bg-white/20 border-white/30 text-white'
                            }`}>
                                <span className="text-7xl md:text-9xl font-black drop-shadow-lg">
                                    {placement}
                                </span>
                            </div>
                            <div className="bg-black/30 backdrop-blur-md px-8 py-4 rounded-2xl border border-white/10">
                                <span className="text-xl md:text-3xl font-bold text-white drop-shadow-sm">
                                    Total Points: {finalPoints}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            );
    }
}