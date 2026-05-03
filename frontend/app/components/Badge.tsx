import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'gray' | 'blue' | 'green' | 'red' | 'yellow';
    children: React.ReactNode;
}

export function Badge({ variant = 'gray', className = '', children, ...props }: BadgeProps) {
    const variants = {
        gray: 'bg-gray-100 text-gray-800 border-gray-200',
        blue: 'bg-blue-100 text-blue-800 border-blue-200',
        green: 'bg-green-100 text-green-800 border-green-200',
        red: 'bg-red-100 text-red-800 border-red-200',
        yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };

    return (
        <span
            className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </span>
    );
}
