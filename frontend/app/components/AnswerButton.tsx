import React from 'react';

type AnswerColorKey = 'red' | 'blue' | 'yellow' | 'green';

interface AnswerButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
    color: number;
    text?: string;
    showShapeOnly?: boolean; // Mobile players usually only see shapes, not text!
}

export function AnswerButton({ color, text, showShapeOnly = false, className = '', ...props }: AnswerButtonProps) {
    const colorStyles: Record<AnswerColorKey, string> = {
        red: 'bg-[#e21b3c] hover:bg-[#c01733] active:bg-[#9e1329]',
        blue: 'bg-[#1368ce] hover:bg-[#1059b0] active:bg-[#0d4a93]',
        yellow: 'bg-[#d89e00] hover:bg-[#b88700] active:bg-[#976f00]',
        green: 'bg-[#26890c] hover:bg-[#20750a] active:bg-[#1a5f08]',
    };

  // SVG shapes for the classic Kahoot feel
    const shapes: Record<AnswerColorKey, React.ReactNode> = {
        red: (
        <svg viewBox="0 0 24 24" className="w-10 h-10 md:w-16 md:h-16 fill-white drop-shadow-md">
            <polygon points="12,2 22,22 2,22" />
        </svg>
        ), // Triangle
        blue: (
        <svg viewBox="0 0 24 24" className="w-10 h-10 md:w-16 md:h-16 fill-white drop-shadow-md">
            <polygon points="12,2 22,12 12,22 2,12" />
        </svg>
        ), // Diamond
        yellow: (
        <svg viewBox="0 0 24 24" className="w-10 h-10 md:w-16 md:h-16 fill-white drop-shadow-md">
            <circle cx="12" cy="12" r="10" />
        </svg>
        ), // Circle
        green: (
        <svg viewBox="0 0 24 24" className="w-10 h-10 md:w-16 md:h-16 fill-white drop-shadow-md">
            <rect x="3" y="3" width="18" height="18" />
        </svg>
        ), // Square
    };

    const colorKeyByValue: Record<number, AnswerColorKey> = {
        1: 'red',
        2: 'blue',
        3: 'yellow',
        4: 'green',
    };

    const colorKey = colorKeyByValue[color];

    return (
        <button
            className={`flex items-center p-4 rounded shadow-[0_4px_0_rgba(0,0,0,0.2)] transition-transform active:translate-y-1 active:shadow-none text-white font-bold text-lg md:text-2xl min-h-[100px] w-full ${colorStyles[colorKey]} ${className}`}
            {...props}
        >
        <div className={`flex items-center ${showShapeOnly ? 'justify-center w-full' : 'justify-start gap-4'}`}>
            {shapes[colorKey]}
            {!showShapeOnly && text && <span className="drop-shadow-md text-left">{text}</span>}
        </div>
        </button>
    );
}
