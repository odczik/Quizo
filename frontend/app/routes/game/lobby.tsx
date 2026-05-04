import { useEffect, useState } from "react";
import { Button } from "~/components/Button";
import { Input } from "~/components/Input";
import { Spinner } from "~/components/Spinner";
import { useGameSocket } from "~/context/WebSocketContext";

export default function Lobby({ params }: { params: { id?: string } }) {
    const { sendMessage, lastMessage, isConnected } = useGameSocket();

    const [error, setError] = useState<string | undefined>(undefined);
    const [gameFound, setGameFound] = useState(false);
    const [pin, setPin] = useState<string>(params.id?.toString() || "");
    const [playerName, setPlayerName] = useState<string>("");
    const [joined, setJoined] = useState(false);

    const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Limit to 6 characters
        if (e.target.value.length > 6) return;
        // Strip out any character that is not a digit (0-9)
        setPin(e.target.value.replace(/\D/g, ""));
    };

    const findGame = () => {
        if (pin.length !== 6) {
            alert("Please enter a valid 6-digit game pin.");
            return;
        }
        location.replace(`/game/${pin}`); // Redirect to the game route which will handle the rest
    };

    // Listen for incoming messages specific to this component
    useEffect(() => {
        if(lastMessage) {
            switch(lastMessage.type) {
                case 'game_update':
                    console.log('Game Update:', lastMessage);
                    break;
                case 'game_found':
                    console.log('Game found:', lastMessage.gameId);
                    setGameFound(true);
                    break;
                case 'game_joined':
                    console.log('Successfully joined game:', lastMessage.gameId);
                    setJoined(true);
                    break;
                case 'error':
                    console.error('Error from server:', lastMessage.message);
                    if(lastMessage.message === 'Game not found') {
                        setError(lastMessage.message);
                    }
                    break;
                default:
                    console.log('Unhandled message type:', lastMessage);
            }
        }
    }, [lastMessage]);

    if (!isConnected) return <Spinner size="lg" />;

    const joinGame = () => {
        if (!playerName.trim()) {
            alert("Please enter a name");
            return;
        }
        sendMessage("join_game", { gameId: pin, name: playerName });
    };

    return (
        <>
        {joined ? (
            <div className="text-center space-y-4">
                <h1 className="text-6xl font-bold mb-8">Waiting for Host to Start the Game...</h1>
            </div>
        ) : (
            <div className="text-center space-y-4">
                {gameFound ? (
                    <>
                    <h1 className="text-6xl font-bold mb-8">Enter Your Name</h1>
                    <Input 
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        placeholder="Mike Oxlong" 
                        className="mb-4 !text-gray-100" 
                    />
                    <Button onClick={() => joinGame()}>Join Game</Button>
                    </>
                ) : (
                    <>
                    <h1 className="text-6xl font-bold mb-8">Enter Game Pin</h1>
                    <Input
                        value={pin}
                        onChange={handlePinChange}
                        placeholder="123456" 
                        type="text"
                        error={error}
                        className="text-center font-bold tracking-widest text-lg text-gray-100 w-48 mx-auto"
                    />
                    <Button
                        variant="secondary" 
                        onClick={() => findGame()} 
                        disabled={pin.length !== 6}
                    >
                        Enter
                    </Button>
                    </>
                )}
            </div>
        )}
        </>
    );
}