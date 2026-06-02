import { Link } from "~/components/Link";
import { Button } from "~/components/Button";

import { useAuth } from "~/context/AuthenticationContext";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import api from "~/utils/api";

export default function Navbar() {
    const { user, isLoading, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const mobileMenuRef = useRef<HTMLDivElement | null>(null);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
    };

    const toggleMobile = (e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
        }
        setMobileOpen((v) => !v);
    };

    // Close mobile menu on outside click or navigation
    useEffect(() => {
        function onClick(e: MouseEvent) {
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
                setMobileOpen(false);
            }
        }
        if (mobileOpen) {
            window.addEventListener("click", onClick);
        }
        return () => window.removeEventListener("click", onClick);
    }, [mobileOpen]);

    return (
        <header className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
            <nav className="relative flex justify-between items-center max-w-7xl mx-auto">
                <Link to="/" className="text-2xl font-bold text-black hover:none">Quizo</Link>

                {/* Mobile hamburger & Join Game */}
                <div className="md:hidden flex items-center gap-2">
                    <Button variant="primary" onClick={() => navigate("/game")}>Join Game</Button>
                    <button
                        aria-label="Toggle menu"
                        aria-expanded={mobileOpen}
                        onClick={toggleMobile}
                        className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {mobileOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                <ul className="hidden md:flex gap-6 items-center">
                    <li><Link to="/demo" variant="subtle">Components Library Demo</Link></li>
                    <li><Link to="/browse" className="hover:underline">Browse Quizzes</Link></li>

                    {user == null ? (
                        <li><Button variant="secondary" onClick={() => navigate("/login")}>Login</Button></li>
                    ) : (
                        <li className="relative group">
                            <Button variant="secondary" className="cursor-default">
                                {user?.name || "Profile"}
                            </Button>
                            <div className="absolute right-0 w-48 mt-2 py-2 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transform -translate-y-2 transition-all duration-300 ease-in-out z-50">
                                <ul>
                                    <li>
                                        <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                            Profile page
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/profile/quizzes" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                            My quizzes
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/quiz/create" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                            Create new quiz
                                        </Link>
                                    </li>
                                    <div className="border-t border-gray-200 my-2"></div>
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
                    <li><Button variant="primary" onClick={() => navigate("/game")}>Join Game</Button></li>
                </ul>

                {/* Mobile menu panel */}
                <div
                    ref={mobileMenuRef}
                    className={`md:hidden absolute left-0 right-0 top-full bg-white border-b border-gray-200 shadow-md z-40 transform transition-all duration-300 ease-in-out ${mobileOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'}`}
                >
                    <div className="px-4 py-4 space-y-2">
                        <Link to="/demo" variant="subtle" className="block">Components Library Demo</Link>
                        <Link to="/browse" className="block">Browse Quizzes</Link>

                        {user == null ? (
                            <Button variant="secondary" onClick={() => { setMobileOpen(false); navigate('/login'); }} className="w-full">Login</Button>
                        ) : (
                            <div className="space-y-1">
                                <div className="px-2 py-1 text-sm font-medium">{user?.name || 'Profile'}</div>
                                <Link to="/profile" className="block px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">Profile page</Link>
                                <Link to="/profile/quizzes" className="block px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">My quizzes</Link>
                                <Link to="/quiz/create" className="block px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">Create new quiz</Link>
                                <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="block w-full text-left px-2 py-2 text-sm text-red-600 hover:bg-gray-100 rounded">Logout</button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    )
}