import { useEffect } from "react";
import { Button } from "~/components/Button";
import { Input } from "~/components/Input";
import { Spinner } from "~/components/Spinner";
import { useGameSocket } from "~/context/WebSocketContext";

export default function Game({ params }: { params: { id: string } }) {
    const { sendMessage, lastMessage, isConnected } = useGameSocket();

    // Listen for incoming messages specific to this component
    useEffect(() => {
        if (lastMessage?.type === 'game_over') {
            alert('The game is finished!');
        }
    }, [lastMessage]);

    if (!isConnected) return <Spinner size="lg" />;

    const join = () => {

    };

    return (
        <div className="text-center space-y-4">
            <h1 className="text-6xl font-bold mb-8">Enter Your Name</h1>
            <Input 
                placeholder="Mike Oxlong" 
                className="mb-4 !text-gray-100" 
            />
            <Button onClick={() => join()}>Join Game</Button>
        </div>
    );
}