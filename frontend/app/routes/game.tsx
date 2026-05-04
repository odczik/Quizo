import { useState } from 'react';
import { Button } from '~/components/Button';
import { Input } from '../components/Input';

export default function GameScreen() {
    const [pin, setPin] = useState("");

    const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Limit to 6 haracters
        if (e.target.value.length > 6) return;
        // Strip out any character that is not a digit (0-9)
        setPin(e.target.value.replace(/\D/g, ""));
    };

    const joinGame = () => {
        if (pin.length !== 6) {
            alert("Please enter a valid 6-digit game pin.");
            return;
        }
        
        
    };

    return (
        <div className="text-center space-y-4">
            <h1 className="text-6xl font-bold mb-8">Enter Game Pin</h1>
            <Input
                value={pin}
                onChange={handlePinChange}
                placeholder="123456" 
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className="text-center font-bold tracking-widest text-lg text-gray-100 w-48 mx-auto"
            />
            <Button
                variant="secondary" 
                onClick={() => joinGame()} 
                disabled={pin.length !== 6}
            >
                Join Game
            </Button>
        </div>
    );
}