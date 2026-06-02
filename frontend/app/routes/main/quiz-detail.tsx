import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { apiClient } from "~/utils/api";
import { Card } from "~/components/Card";
import { Button } from "~/components/Button";
import { Spinner } from "~/components/Spinner";
import { useAuth } from "~/context/AuthenticationContext";

export default function QuizDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isLoading } = useAuth();

    const [quiz, setQuiz] = useState<any>(null);
    const [isLiked, setIsLiked] = useState(false);
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
                setIsLiked(data.liked_by_user || false);
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

    const handleLikeToggle = async () => {
        try {
            const res = await apiClient(`/api/quizzes/${id}/like`, {
                method: isLiked ? "DELETE" : "POST",
            });
            if (!res.ok) {
                throw new Error("Failed to update like status.");
            }
            setIsLiked(!isLiked);
        } catch (err: any) {
            alert(err.message || "An error occurred while updating like status.");
        }
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
                    {user && (
                        <Button 
                            variant={isLiked ? "primary" : "default"} 
                            onClick={() => {
                                if (!user) {
                                    navigate("/login");
                                } else {
                                    handleLikeToggle();
                                }
                            }}
                            className="p-2 border border-gray-300 shadow-sm disabled:opacity-50"
                            title={isLiked ? "Unlike quiz" : "Like quiz"}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.385a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                            </svg>
                        </Button>
                    )}
                </div>
            </Card>
        </div>
    );
}