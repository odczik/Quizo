import { useEffect, useState } from "react";
import { useGameSocket } from "~/context/WebSocketContext";
import { useNotification } from "~/context/NotificationContext";

export default function Game() {
    const { sendMessage, lastMessage, isConnected } = useGameSocket();
    const { notify } = useNotification();

    useEffect(() => {
        if (lastMessage) {
            switch (lastMessage.type) {
                // case "next_question":
                //     notify(`Next question`, "info");
                //     break;
                // case "question":
                //     notify(`Question: ${lastMessage.question_text}`, "info");
                //     break;
                // case "answers":
                //     notify(`Answers: ${lastMessage.answers?.map((a: any) => a.answer_text).join(", ")}`, "info");
                //     break;
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

    return (
        <div className="flex items-center justify-center h-screen">
            <h1 className="text-4xl font-bold">Game Page</h1>
        </div>
    );
}