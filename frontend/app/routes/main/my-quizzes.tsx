import { useEffect, useState } from "react";
import { Link } from "~/components/Link";
import { apiClient } from "~/utils/api";
import { useAuth } from "~/context/AuthenticationContext";

interface Quiz {
    id: number;
    title: string;
    description: string | null;
    image: string | null;
    created_at: string;
    default_time_limit: number;
}

export default function MyQuizzes() {
    const { user, isLoading: authLoading } = useAuth();
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        if (authLoading) {
            return;
        }

        if (!user) {
            setIsLoading(false);
            setQuizzes([]);
            setError("Please log in to view your quizzes.");
            return;
        }

        const fetchMyQuizzes = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await apiClient("/api/quizzes");
                if (!response.ok) {
                    if (response.status === 401) {
                        setError("Please log in to view your quizzes.");
                        setQuizzes([]);
                        return;
                    }
                    throw new Error("Failed to load your quizzes.");
                }

                const data = await response.json();
                if (!isMounted) return;
                setQuizzes(data.created ?? []);
            } catch (err: any) {
                if (!isMounted) return;
                setError(err?.message ?? "An error occurred while loading quizzes.");
            } finally {
                if (!isMounted) return;
                setIsLoading(false);
            }
        };

        fetchMyQuizzes();

        return () => {
            isMounted = false;
        };
    }, [authLoading, user]);

    return (
        <div className="flex flex-col items-center min-h-[80vh] px-4 py-8 max-w-7xl mx-auto w-full">
            <div className="w-full flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-extrabold mb-2">My Quizzes</h1>
                    <p className="text-gray-600 max-w-2xl">
                        View and manage the quizzes you have created. If you haven’t created one yet, start with a new quiz.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link
                        to="/quiz/create"
                        className="inline-flex items-center justify-center px-4 py-2 rounded font-medium transition-colors bg-blue-500 text-white hover:bg-blue-600"
                    >
                        Create New Quiz
                    </Link>
                </div>
            </div>

            {authLoading || isLoading ? (
                <div className="py-20 text-center text-gray-500 w-full flex flex-col items-center">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-lg">Loading your quizzes...</p>
                </div>
            ) : error ? (
                <div className="py-20 text-center text-red-500 w-full">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h3 className="text-2xl font-semibold mb-2">{user ? "Could not load your quizzes" : "Sign in required"}</h3>
                    <p>{error}</p>
                    {!user && (
                        <div className="mt-6">
                            <Link
                                to="/login"
                                className="inline-flex items-center justify-center px-4 py-2 rounded font-medium transition-colors bg-blue-500 text-white hover:bg-blue-600"
                            >
                                Log in to continue
                            </Link>
                        </div>
                    )}
                </div>
            ) : quizzes.length > 0 ? (
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quizzes.map((quiz) => (
                        <div key={quiz.id} className="group bg-white rounded-3xl overflow-hidden shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                            {quiz.image ? (
                                <img src={quiz.image} alt={quiz.title} className="w-full h-48 object-cover" />
                            ) : (
                                <div className="w-full h-48 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                                    <span className="text-5xl">🎯</span>
                                </div>
                            )}

                            <div className="p-5 flex flex-col gap-3">
                                <Link to={`/browse/${quiz.id}`} className="text-xl font-semibold text-gray-900 hover:text-blue-600">
                                    {quiz.title}
                                </Link>
                                <p className="text-gray-600 line-clamp-3 min-h-[3rem]">{quiz.description ?? "No description provided."}</p>
                                <div className="flex items-center justify-between text-sm text-gray-500">
                                    <span>Created {new Date(quiz.created_at).toLocaleDateString()}</span>
                                    <span>{quiz.default_time_limit}s</span>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <Link
                                        to={`/browse/${quiz.id}`}
                                        className="flex-1 inline-flex items-center justify-center px-4 py-2 rounded font-medium transition-colors bg-gray-200 text-gray-800 hover:bg-gray-300"
                                    >
                                        View
                                    </Link>
                                    <Link
                                        to={`/quiz/create?edit=${quiz.id}`}
                                        className="flex-1 inline-flex items-center justify-center px-4 py-2 rounded font-medium transition-colors border border-gray-300 text-gray-700 hover:bg-gray-50"
                                    >
                                        Edit
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center text-gray-500 w-full">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-2xl font-semibold text-gray-700">No quizzes found</h3>
                    <p className="max-w-xl mx-auto">You haven’t created any quizzes yet. Create one to see it listed here.</p>
                    <div className="mt-6">
                        <Link
                            to="/quiz/create"
                            className="inline-flex items-center justify-center px-4 py-2 rounded font-medium transition-colors bg-blue-500 text-white hover:bg-blue-600"
                        >
                            Create your first quiz
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
