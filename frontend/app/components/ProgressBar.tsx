import React from 'react';

export interface ProgressBarProps {
    progress: number; // 0 to 100
    color?: 'blue' | 'green' | 'red' | 'yellow' | 'white';
    className?: string;
    height?: 'sm' | 'md' | 'lg';
}

export function ProgressBar({ progress, color = 'blue', className = '', height = 'md' }: ProgressBarProps) {
    const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);
    const safeProgress = clamp(progress, 0, 100);

    const colors = {
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        red: 'bg-red-500',
        yellow: 'bg-yellow-500',
        white: 'bg-white',
    };

    const heights = {
        sm: 'h-1.5',
        md: 'h-3',
        lg: 'h-5',
    };

    return (
        <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${heights[height]} ${className}`}>
            <div
                className={`${colors[color]} h-full transition-all duration-300 ease-linear`}
                style={{ width: `${safeProgress}%` }}
            />
        </div>
    );
}
