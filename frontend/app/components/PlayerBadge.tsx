import React from 'react';

export interface PlayerBadgeProps {
    name: string;
    onKick?: () => void; // Host can click the X to remove inappropriate names
}

export function PlayerBadge({ name, onKick }: PlayerBadgeProps) {
    // Generate a fun background color deterministically based on the player's name
    // This prevents hydration mismatches between SSR and Client rendering!
    const funColors = ['bg-pink-500', 'bg-purple-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500'];
    
    const hash = name.split('').reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    const deterministicColor = funColors[Math.abs(hash) % funColors.length];

    return (
        <div className={`relative inline-flex items-center px-4 py-2 rounded shadow-md text-white font-bold text-lg animate-bounce-in ${deterministicColor}`}>
            <span>{name}</span>
            {onKick && (
                <button 
                    onClick={onKick}
                    className="ml-3 text-white/70 hover:text-white transition-colors cursor-pointer"
                    title="Kick player"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
    );
}
