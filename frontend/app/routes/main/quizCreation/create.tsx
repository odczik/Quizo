import { Select } from "~/components/Select";
import { Button } from "~/components/Button";
import { useState, useEffect } from "react";
import { apiClient } from "~/utils/api";
import { useAuth } from "~/context/AuthenticationContext";
import { useNavigate } from "react-router";

export default function CreateQuiz() {
    const { user, isLoading } = useAuth();
    const navigate = useNavigate();

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
                <h1 className="text-4xl font-bold mb-6">Checking your login status…</h1>
                <p className="text-gray-600">Please wait while we verify whether you are signed in.</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
                <h1 className="text-4xl font-bold mb-6 text-red-600">Please log in or return to the browsing page</h1>
                <p className="text-gray-600 max-w-xl">
                    Only logged-in users can create a quiz. Please sign in first, then return to the create page.
                </p>
                <div className="mt-6 flex flex-col sm:flex-row gap-4">
                    <Button variant="primary" onClick={() => navigate('/login')}>
                        Go to Login
                    </Button>
                    <Button onClick={() => navigate('/')}>Back to Browsing page</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
            <h1 className="text-4xl font-bold mb-6">Create a New Quiz</h1>
        </div>
    );
}