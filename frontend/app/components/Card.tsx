import React from 'react';

interface CardProps {
    title?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    footer?: React.ReactNode;
}

export function Card({ title, children, className = '', footer }: CardProps) {
    return (
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
        {title && (
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50/50 font-semibold text-lg text-gray-800">
            {title}
            </div>
        )}
        <div className="p-4">
            {children}
        </div>
        {footer && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50/50 flex items-center">
            {footer}
            </div>
        )}
        </div>
    );
}
