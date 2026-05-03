import React from 'react';

export interface ToggleSwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    description?: string;
}

export function ToggleSwitch({ checked, onChange, label, description }: ToggleSwitchProps) {
    return (
        <label className="flex items-center cursor-pointer">
            <div className="relative">
                <input
                type="checkbox"
                className="sr-only"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                />
                <div className={`block w-14 h-8 rounded-full transition-colors ${checked ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${checked ? 'transform translate-x-6' : ''}`}></div>
            </div>
            {(label || description) && (
                <div className="ml-3 flex flex-col">
                {label && <span className="text-sm font-medium text-gray-900">{label}</span>}
                {description && <span className="text-xs text-gray-500">{description}</span>}
                </div>
            )}
        </label>
    );
}
