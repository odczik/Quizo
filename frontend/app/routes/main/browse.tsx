import { Link } from "~/components/Link";
import { Select } from "~/components/Select";
import { Button } from "~/components/Button";
import { useState, useEffect } from "react";
import { apiClient } from "~/utils/api";
import { useAuth } from "~/context/AuthenticationContext";
import { useNavigate } from "react-router";

interface Quiz {
    id: number;
    title: string;
    description: string | null;
    image_url: string | null;
    created_by: string;
    default_time_limit: number;
    created_at: string;
}

const DUMMY_QUIZZES: Quiz[] = [
    { id: 1, title: "General Knowledge Mastery", description: "Test your everyday knowledge with these fun trivia questions.", image_url: "https://placehold.co/600x400/blue/white?text=General+Knowledge", created_by: "AliceFrom The Wonderland", default_time_limit: 30, created_at: "2026-05-01T10:00:00Z" },
    { id: 2, title: "History Buff", description: "How well do you know world history? From ancient times to modern days.", image_url: "https://placehold.co/600x400/orange/white?text=History", created_by: "Bob", default_time_limit: 45, created_at: "2026-05-02T14:30:00Z" },
    { id: 3, title: "Pop Culture 2020s", description: "Music, movies, celebs, and current events from the roaring 2020s.", image_url: null, created_by: "Charlie", default_time_limit: 15, created_at: "2026-05-03T09:15:00Z" },
    { id: 4, title: "Science & Nature", description: "Explore the wonders of the universe, biology, physics, and more.", image_url: "https://placehold.co/600x400/green/white?text=Science", created_by: "David", default_time_limit: 60, created_at: "2026-05-04T16:45:00Z" },
    { id: 5, title: "Geography Guesser", description: "Can you name these countries and capitals?", image_url: "https://placehold.co/600x400/purple/white?text=Geography", created_by: "Eve", default_time_limit: 20, created_at: "2026-05-05T11:20:00Z" },
];

export default function Browse() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [quizzes, setQuizzes] = useState<Quiz[]>(DUMMY_QUIZZES);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const [likedOnly, setLikedOnly] = useState(false);
    
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleCreateQuiz = () => {
        if (user) {
            navigate("/quiz/create");
        } else {
            navigate("/login");
        }
    };

    useEffect(() => {
        let isMounted = true;
        
        const fetchQuizzes = async () => {
            setIsLoading(true);
            setError(null);
            
            try {
                const params = new URLSearchParams();
                if (searchQuery) params.append("search", searchQuery);
                if (sortBy) params.append("sort", sortBy);
                if (likedOnly) params.append("liked_only", "1");

                const response = await apiClient(`/api/discover?${params.toString()}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch quizzes");
                }
                
                const data = await response.json();
                if (isMounted) {
                    setQuizzes(data);
                }
            } catch (err: any) {
                if (isMounted) {
                    setError(err.message || "An error occurred");
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        const debounceTimer = setTimeout(() => {
            fetchQuizzes();
        }, 300);

        return () => {
            isMounted = false;
            clearTimeout(debounceTimer);
        };
    }, [searchQuery, sortBy, likedOnly]);

    return (
        <div className="flex flex-col items-center min-h-[80vh] px-4 py-8 max-w-7xl mx-auto w-full">
            <div className="text-center max-w-3xl mb-12">
                <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent drop-shadow-sm">
                    Browse Quizzes
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                    Explore a wide variety of quizzes created by our community. Search, filter, and find the perfect quiz for your next game night.
                </p>
            </div>

            {/* Controls (Search, Filter, Sort) */}
            <div className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="w-full md:w-1/2">
                    <input 
                        type="text" 
                        placeholder="Search quizzes..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                </div>

                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center">
                    {user && (
                        <Button 
                            variant={likedOnly ? "primary" : ""} 
                            onClick={() => {
                                if (!user) {
                                    navigate("/login");
                                } else {
                                    setLikedOnly(!likedOnly);
                                }
                            }}
                            className="p-2 border border-gray-300 shadow-sm disabled:opacity-50"
                            title={likedOnly ? "Showing liked quizzes" : "Show liked quizzes only"}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={likedOnly ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.385a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                            </svg>
                        </Button>
                    )}
                    <Select 
                        value={sortBy} 
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full md:w-auto"
                        options={[
                            { value: "newest", label: "Newest First" },
                            { value: "oldest", label: "Oldest First" },
                            { value: "az", label: "Title A-Z" },
                            { value: "za", label: "Title Z-A" },
                        ]}
                    />
                    <Button variant="primary" onClick={handleCreateQuiz} className="w-full md:w-auto whitespace-nowrap flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Create New Quiz
                    </Button>
                </div>
            </div>

            {/* Quizzes Grid */}
            {isLoading ? (
                <div className="py-20 text-center text-gray-500 w-full flex flex-col items-center">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-lg">Loading quizzes...</p>
                </div>
            ) : error ? (
                <div className="py-20 text-center text-red-500 w-full">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h3 className="text-2xl font-semibold mb-2">Oops! Something went wrong</h3>
                    <p>{error}</p>
                </div>
            ) : quizzes.length > 0 ? (
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quizzes.map(quiz => (
                        <div key={quiz.id} className="group bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 hover:shadow-lg transition-shadow flex flex-col relative ">
                            {quiz.image_url ? (
                                <img src={quiz.image_url} alt={quiz.title} className="w-full h-48 object-cover" />
                            ) : (
                                <div className="w-full h-48 bg-gradient-to-br from-indigo-100 to-blue-50 flex items-center justify-center">
                                    <span className="text-4xl">🎲</span>
                                </div>
                            )}
                            
                            {/* Standard content area */}
                            <div className="p-5 flex flex-col flex-grow bg-white z-10 relative">
                                <div className="flex justify-start items-end mb-2 w-full overflow-hidden flex-shrink-0">
                                    <Link to={`/browse/${quiz.id}`} className="text-xl !font-bold text-gray-900 flex-shrink-0 hover:text-blue-600 max-w-[70%]" title={quiz.title}>
                                        {quiz.title}
                                    </Link>
                                    <p className="text-xs text-gray-400 ml-2 mb-0.5 truncate flex-grow text-right" title={`By ${quiz.created_by}`}>
                                        By {quiz.created_by}
                                    </p>
                                </div>
                                <p className="text-gray-600 line-clamp-2">{quiz.description}</p>
                            </div>

                            {/* Hover compartment - slides up from below the card */}
                            <div className="absolute left-0 right-0 bottom-0 translate-y-full group-hover:translate-y-0 bg-white shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.1)] rounded-t-2xl p-4 z-20 flex items-center justify-between border-t border-gray-100 transition-transform duration-150 ease-in-out text-sm text-gray-500 h-[60px]">
                                <div className="flex items-center gap-1 font-medium">
                                    ⏱️ {quiz.default_time_limit}s
                                </div>
                                <Link to={`/game/host/${quiz.id}`} className="font-bold text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full hover:bg-blue-100 transition-colors">
                                    Play Now →
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center text-gray-500">
                    <div className="text-6xl mb-4">🤷‍♂️</div>
                    <h3 className="text-2xl font-semibold text-gray-700">No quizzes found</h3>
                    <p>Try adjusting your search or filters.</p>
                </div>
            )}
        </div>
    );
}