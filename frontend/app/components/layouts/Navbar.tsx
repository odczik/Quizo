import { Link } from "~/components/Link";
import { Button } from "~/components/Button";

import { useAuth } from "~/context/AuthenticationContext";
import { useEffect } from "react";
import api from "~/utils/api";


export default function Navbar() {
    const { user, isLoading, checkAuth } = useAuth();

    const handleLogout = async () => {
        try {
            await api.apiClient('/api/user/logout', { method: 'POST' });
            await checkAuth();
            window.location.href = '/';
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    useEffect(() => {
        console.log("Auth state changed:", { user, isLoading });
    }, [isLoading, user]);

    return (
        <header className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
            <nav className="flex justify-between items-center max-w-7xl mx-auto">
                <Link to="/" className="text-2xl font-bold text-black hover:none">Quizo</Link>
                <ul className="flex gap-6 items-center">
                    <li><Link to="/demo" variant="subtle">Components Library Demo</Link></li>
                    <li><Link to="/browse" className="hover:underline">Browse Quizzes</Link></li>

                    {user == null ? (
                        <li><Button variant="secondary" onClick={() => location.href = "/login"}>Login</Button></li>
                    ) : (
                        <li className="relative group">
                            <Button variant="secondary" className="cursor-default">
                                {user?.name || "Profile"}
                            </Button>
                            <div className="absolute right-0 w-48 mt-2 py-2 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                <ul>
                                    <li>
                                        <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                            Profile page
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/quiz/create" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                            Create new quiz
                                        </Link>
                                    </li>
                                    <li>
                                        <button 
                                            onClick={handleLogout} 
                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 cursor-pointer"
                                        >
                                            Logout
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </li>
                    )}
                    <li><Button variant="primary" onClick={() => location.href = "/game"}>Join Game</Button></li>
                </ul>
            </nav>
        </header>
    )
}