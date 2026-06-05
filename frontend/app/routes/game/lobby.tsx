import { useEffect, useState } from "react";
import { useMatches } from "react-router";
import { QRCode } from "react-qr-code";
import { Button } from "~/components/Button";
import { Input } from "~/components/Input";
import { PlayerBadge } from "~/components/PlayerBadge";
import { Spinner } from "~/components/Spinner";

import { useGameSocket } from "~/context/WebSocketContext";
import { useAuth } from "~/context/AuthenticationContext";
import { useNotification } from "~/context/NotificationContext";

export default function Lobby({ params }: { params: { id?: string } }) {
    const matches = useMatches();
    const { sendMessage, lastMessage, isConnected } = useGameSocket();
    const { user } = useAuth();
    const { notify } = useNotification();

    const [error, setError] = useState<string | undefined>(undefined);
    const [gameFound, setGameFound] = useState(false);
    const [pin, setPin] = useState<string>(params.id?.toString() || "");
    const [playerName, setPlayerName] = useState<string>("");
    const [joined, setJoined] = useState(false);
    const [players, setPlayers] = useState<string[]>([]); // Track players in lobby
    const [isLoading, setIsLoading] = useState(true);
    const [isHost] = useState(matches[matches.length - 1].id === "host-lobby");

    useEffect(() => {
        if (isConnected) {
            if (user) {
                // TODO: fetch jwt token from backend and send authenticate message to websocket server
                //sendMessage("authenticate", { token: "" });
            }

            if (isHost) {
                sendMessage("create_game", { quizId: params.id }); // Host creates game immediately on lobby load
            } else {
                if(params.id) {
                    // If we have a game ID, we can send it immediately to find that game room
                    sendMessage("find_game", { gameId: params.id });
                }
                setIsLoading(false); // For player lobby, we can show the form immediately
            }
        }
        
    }, [isConnected, params, matches]);

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
                case 'game_created':
                    console.log('Game created with ID:', lastMessage.gameId);
                    setPin(lastMessage.gameId); // Update pin to show the generated game ID to the host
                    setIsLoading(false);
                    setJoined(true); // Host is automatically joined to their own game
                    break;
                case 'game_found':
                    console.log('Game found:', lastMessage.gameId);
                    setGameFound(true);
                    break;
                case 'game_joined':
                    console.log('Successfully joined game:', lastMessage.gameId);
                    setPlayers(lastMessage.players); // Update player list when someone joins
                    setJoined(true);
                    break;
                case 'player_joined':
                    console.log('Player joined:', lastMessage.username);
                    setPlayers(prev => [...prev, lastMessage.username]);
                    break;
                case 'player_left':
                    console.log('Player left:', lastMessage.username);
                    setPlayers(prev => prev.filter(name => name !== lastMessage.username));
                    break;
                case 'kicked':
                    notify('You have been kicked from the game.', 'error');
                    setJoined(false);
                    setGameFound(false);
                    setPlayers([]);
                    setError("");
                    break;
                case 'game_ended':
                    notify(lastMessage.message || 'Game has ended.', 'info');
                    setJoined(false);
                    setGameFound(false);
                    setPin("");
                    setPlayers([]);
                    break;
                case "game_start":
                    console.log('Game started! (lobby received start message)');
                    break;
                case 'error':
                    console.error('Error from server:', lastMessage.message);
                    setError(lastMessage.message);
                    notify(lastMessage.message, "error");
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
        sendMessage("join_game", { gameId: pin, username: playerName });
    };

    return (
        <>
        {!isLoading ? (
            joined ? (
                // Waiting for host to start the game - this is where you could show a list of players who have joined, etc.
                <div className="text-center space-y-4">
                    {isHost ? (
                        <>
                        <QRCode 
                            value={`${window.location.origin}/game/${pin}`} 
                            size={256} 
                            className="mx-auto mb-8 border-4 border-white rounded-lg p-2" 
                            title="Scan to Join Game"
                            bgColor="#00000000"
                            fgColor="#ffffff"
                        />
                        <h1 className="text-6xl font-bold mb-8">Game Pin: <code className="bg-gray-200 text-indigo-800 p-2 rounded">{pin}</code></h1>
                        </>
                    ) : (
                        <h1 className="text-6xl font-bold mb-8">Waiting for Host to Start the Game...</h1>
                    )}
                    <div className="bg-indigo-500 p-8 rounded border-4 border-dashed border-gray-300 min-h-[200px] max-w-[90%] mx-auto">
                        <div className="flex flex-wrap gap-4 justify-center">
                            {players.length > 0 ? (
                                players.map((player) => (
                                    isHost ? (
                                        <PlayerBadge key={player} name={player} onKick={() => sendMessage("kick_player", { gameId: pin, username: player })} />
                                    ) : (
                                        <PlayerBadge key={player} name={player} /> // Regular player view without kick option
                                    )
                                ))
                            ) : (
                                <h2 className="text-2xl text-gray-100">No players have joined yet...</h2>
                            )}
                        </div>
                    </div>
                    {isHost && (
                        <Button variant="secondary" onClick={() => sendMessage("start_game", { gameId: pin })}>
                            Start Game
                        </Button>
                    )}
                </div>
            ) : (
                // Initial lobby view where player enters game pin and name
                <form className="text-center space-y-4" onSubmit={(e) => { e.preventDefault(); }}>
                    {gameFound ? (
                        // If game is found, ask for player name
                        <>
                        <h1 className="text-6xl font-bold mb-8">Enter Your Name</h1>
                        <Input 
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            placeholder="Mike Oxlong" 
                            error={error}
                            className="mb-4 !text-gray-100 max-w-[90%] mx-auto" 
                            maxLength={20}
                        />
                        <Button onClick={() => joinGame()}>Join Game</Button>
                        </>
                    ) : (
                        // Initial view to enter game pin
                        <>
                        <h1 className="text-6xl font-bold mb-8">Enter Game Pin</h1>
                        <Input
                            value={pin}
                            onChange={handlePinChange}
                            placeholder="123456" 
                            type="text"
                            inputMode="numeric"
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
                </form>
            )
        ) : (
            <div className="flex h-64 items-center justify-center">
                <Spinner size="lg" />
            </div>
        )}
        </>
    );
}