import React from 'react';

export interface SelectOption {
    value: string;
    label: string;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
    label?: string;
    error?: string;
    options?: SelectOption[];
    children?: React.ReactNode;
}

export function Select({ label, error, options, className = '', children, ...props }: SelectProps) {
    return (
        <div className="flex flex-col gap-1 w-full">
            {label && (
                <label className="text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}
            <select
                className={`px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-colors bg-white ${
                    error 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                } ${props.disabled ? 'bg-gray-100 cursor-not-allowed opacity-70' : ''} ${className}`}
                {...props}
            >
                {options 
                    ? options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)
                    : children
                }
            </select>
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
}
