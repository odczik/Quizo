import React from 'react';
import { Button } from './Button';

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 transition-opacity">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-4 overflow-y-auto max-h-[70vh]">
                    {children}
                </div>
                {footer && (
                    <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-end gap-2">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
