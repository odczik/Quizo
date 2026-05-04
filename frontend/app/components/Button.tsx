import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
}

export function Button({ children, variant = 'primary', className = '', ...props }: ButtonProps) {
    const baseStyles = 'px-4 py-2 rounded font-medium transition-colors';
    const variants = {
        primary: 'bg-blue-500 text-white hover:bg-blue-600',
        secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    };

    return (
        <button 
            className={`${'cursor-pointer ' + baseStyles} ${variants[variant]} ${className} ${props.disabled ? 'opacity-50 !cursor-not-allowed' : ''}`.trim()} 
            {...props}
        >
            {children}
        </button>
    );
}
