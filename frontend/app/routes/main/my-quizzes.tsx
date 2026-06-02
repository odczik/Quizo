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

interface MyQuizzesResponse {
    created: Quiz[];
    liked: Quiz[];
}

function QuizCard({ quiz, showEdit }: { quiz: Quiz; showEdit: boolean }) {
    return (
        <div className="group bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 hover:shadow-lg transition-shadow flex flex-col relative">
            {quiz.image ? (
                <img src={quiz.image} alt={quiz.title} className="w-full h-48 object-cover" />
            ) : (
                <div className="w-full h-48 bg-gradient-to-br from-indigo-100 to-blue-50 flex items-center justify-center">
                    <span className="text-4xl">🎲</span>
                </div>
            )}

            <div className="p-5 flex flex-col flex-grow bg-white z-10 relative">
                <div className="flex justify-start items-end mb-2 w-full overflow-hidden flex-shrink-0">
                    <Link
                        to={`/browse/${quiz.id}`}
                        className="text-xl !font-bold text-gray-900 flex-shrink-0 hover:text-blue-600 max-w-[70%]"
                        title={quiz.title}
                    >
                        {quiz.title}
                    </Link>
                    <p className="text-xs text-gray-400 ml-2 mb-0.5 truncate flex-grow text-right" title={`Created ${new Date(quiz.created_at).toLocaleDateString()}`}>
                        {new Date(quiz.created_at).toLocaleDateString()}
                    </p>
                </div>
                <p className="text-gray-600 line-clamp-2">{quiz.description ?? "No description provided."}</p>
            </div>

            <div className="absolute left-0 right-0 bottom-0 translate-y-full group-hover:translate-y-0 bg-white shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.1)] rounded-t-2xl p-4 z-20 flex items-center justify-between border-t border-gray-100 transition-transform duration-150 ease-in-out text-sm text-gray-500 h-[60px]">
                <div className="flex items-center gap-1 font-medium">
                    ⏱️ {quiz.default_time_limit}s
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        to={`/browse/${quiz.id}`}
                        className="font-bold text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
                    >
                        Play Now →
                    </Link>
                    {showEdit && (
                        <Link
                            to={`/quiz/create?edit=${quiz.id}`}
                            className="font-semibold text-gray-700 bg-gray-100 px-4 py-1.5 rounded-full hover:bg-gray-200 transition-colors"
                        >
                            Edit
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}

function QuizSection({
    title,
    quizzes,
    showEdit,
    emptyState,
}: {
    title: string;
    quizzes: Quiz[];
    showEdit: boolean;
    emptyState: string;
}) {
    return (
        <section className="w-full space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                <span className="text-sm font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                    {quizzes.length}
                </span>
            </div>

            {quizzes.length > 0 ? (
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quizzes.map((quiz) => (
                        <QuizCard key={`${title}-${quiz.id}`} quiz={quiz} showEdit={showEdit} />
                    ))}
                </div>
            ) : (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center text-gray-600">
                    {emptyState}
                </div>
            )}
        </section>
    );
}

export default function MyQuizzes() {
    const { user, isLoading: authLoading } = useAuth();
    const [createdQuizzes, setCreatedQuizzes] = useState<Quiz[]>([]);
    const [likedQuizzes, setLikedQuizzes] = useState<Quiz[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        if (authLoading) {
            return;
        }

        if (!user) {
            setIsLoading(false);
            setCreatedQuizzes([]);
            setLikedQuizzes([]);
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
                        setCreatedQuizzes([]);
                        setLikedQuizzes([]);
                        return;
                    }
                    throw new Error("Failed to load your quizzes.");
                }

                const data: MyQuizzesResponse = await response.json();
                if (!isMounted) return;
                setCreatedQuizzes(Array.isArray(data?.created) ? data.created : []);
                setLikedQuizzes(Array.isArray(data?.liked) ? data.liked : []);
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
            ) : createdQuizzes.length > 0 || likedQuizzes.length > 0 ? (
                <div className="w-full flex flex-col gap-10">
                    <QuizSection
                        title="Created by you"
                        quizzes={createdQuizzes}
                        showEdit={true}
                        emptyState="You have not created any quizzes yet."
                    />
                    <QuizSection
                        title="Liked quizzes"
                        quizzes={likedQuizzes}
                        showEdit={false}
                        emptyState="You have not liked any quizzes yet."
                    />
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
