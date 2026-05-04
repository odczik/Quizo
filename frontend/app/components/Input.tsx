import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    labelClassName?: string;
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, labelClassName, error, className = '', id, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
        return (
        <div className="flex flex-col gap-1 w-full">
            {label && (
            <label htmlFor={inputId} className={`text-sm font-medium text-gray-700 ${labelClassName || ''}`}>
                {label}
            </label>
            )}
            <input
            id={inputId}
            ref={ref}
            className={`px-3 py-2 border rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
            } ${className}`}
            {...props}
            />
            {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
        );
    }
);

Input.displayName = 'Input';
