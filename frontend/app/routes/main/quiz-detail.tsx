import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { apiClient } from "~/utils/api";
import { Card } from "~/components/Card";
import { Button } from "~/components/Button";
import { Spinner } from "~/components/Spinner";

export default function QuizDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const res = await apiClient(`/api/quizzes/${id}`);
                if (!res.ok) {
                    throw new Error("Failed to fetch quiz details.");
                }
                const data = await res.json();
                console.log("Fetched quiz data:", data);
                setQuiz(data);
            } catch (err: any) {
                setError(err.message || "An error occurred.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchQuiz();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    if (error || !quiz) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center gap-4">
                <h2 className="text-2xl font-bold text-red-500">Error</h2>
                <p>{error || "Quiz not found"}</p>
                <Button onClick={() => navigate("/browse")}>Back to Browse</Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4">
            <Button variant="secondary" onClick={() => navigate(-1)} className="mb-4">
                &larr; Back
            </Button>
            
            <Card className="p-8 shadow-lg">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">{quiz.title || quiz.name || "Untitled Quiz"}</h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            {quiz.description || "No description provided."}
                        </p>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 flex gap-4">
                    <Button onClick={() => navigate(`/game/host/${quiz.id}`)} variant="primary">
                        Host Game
                    </Button>
                </div>
            </Card>
        </div>
    );
}