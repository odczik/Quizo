import React from 'react';

export interface ComponentShowcaseProps {
    title: string;
    description?: string;
    children: React.ReactNode;
}

export function ComponentShowcase({ title, description, children }: ComponentShowcaseProps) {
    return (
        <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">{title}</span>
                {description && (
                <span className="text-sm font-normal text-gray-500 ml-2">{description}</span>
                )}
            </h2>
            {children}
        </section>
    );
}
