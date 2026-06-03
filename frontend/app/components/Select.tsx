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

export function Select({ label, error, options, className = '', children, id, ...props }: SelectProps) {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
        <div className="flex flex-col gap-1 w-full">
            {label && (
                <label htmlFor={selectId} className="text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}
            <div className="relative w-full">
                <select
                    id={selectId}
                    className={`appearance-none w-full px-3 py-2 pr-8 border rounded-md text-black focus:outline-none focus:ring-2 transition-colors bg-white ${
                        error 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 focus:ring-blue-500'
                    } ${props.disabled ? 'bg-gray-100 cursor-not-allowed opacity-70' : ''} ${className}`}
                    {...props}
                >
                    {options 
                        ? options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)
                        : children
                    }
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
}
