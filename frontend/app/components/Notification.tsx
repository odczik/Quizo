import React, { useEffect, useState } from 'react';

export type NotificationType = 'info' | 'success' | 'error' | 'warning';

export interface NotificationProps {
    message: string;
    type: NotificationType;
    onClose: () => void;
}

export function Notification({ message, type, onClose }: NotificationProps) {
    const [progress, setProgress] = useState(100);

    // Trigger the animation shortly after mount so the browser registers the transition
    useEffect(() => {
        const timer = setTimeout(() => setProgress(0), 50);
        return () => clearTimeout(timer);
    }, []);

    const typeStyles = {
        info: 'bg-blue-50 text-blue-800 border-blue-200',
        success: 'bg-green-50 text-green-800 border-green-200',
        error: 'bg-red-50 text-red-800 border-red-200',
        warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    };

    return (
        <div className={`relative p-4 rounded-md border shadow-lg flex items-start justify-between min-w-[300px] max-w-sm pointer-events-auto overflow-hidden transform transition-all duration-300 ${typeStyles[type]}`}>
            <span className="text-sm font-medium z-10">{message}</span>
            <button 
                onClick={onClose} 
                className="ml-4 text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded transition-colors z-10"
                aria-label="Close"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            {/* Lifetime Progress Bar */}
            <div 
                className="absolute bottom-0 left-0 h-1 bg-black/15"
                style={{ width: `${progress}%`, transition: 'width 4.95s linear' }}
            />
        </div>
    );
}
