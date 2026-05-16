import { Select } from "~/components/Select";
import { Button } from "~/components/Button";
import { useState, useEffect } from "react";
import { apiClient } from "~/utils/api";
import { useAuth } from "~/context/AuthenticationContext";
import { useNavigate } from "react-router";

export default function CreateQuiz() {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
            <h1 className="text-4xl font-bold mb-6">Create a New Quiz</h1>
        </div>
    );
}