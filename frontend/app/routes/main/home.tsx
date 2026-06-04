import type { Route } from "../main/+types/home";
import { Link } from "~/components/Link";
export function meta({}: Route.MetaArgs) {
    return [
        { title: "Quizo" },
        { name: "description", content: "Welcome to React Router!" },
    ];
}

export default function Home() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
            <div className="max-w-3xl">
                <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent drop-shadow-sm">
                    Welcome to Quizo!
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed">
                    Your ultimate real-time quiz platform. Challenge your friends, create custom games, and prove your trivia mastery.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                    <Link 
                        to="/game" 
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-full transition-transform transform hover:scale-105 shadow-lg text-lg"
                    >
                        Join a Game
                    </Link>
                    <Link 
                        to="/browse" 
                        className="bg-indigo-100 hover:bg-indigo-200 text-indigo-800 font-bold px-8 py-3 rounded-full transition-transform transform hover:scale-105 shadow-md text-lg"
                    >
                        Browse quizzes
                    </Link>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mt-24 max-w-5xl text-left">
                <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                    <div className="text-4xl mb-4">🚀</div>
                    <h3 className="text-xl font-bold mb-2">Real-time Action</h3>
                    <p className="text-gray-600">Compete with friends in real-time. Answer fast to earn more points and climb the live leaderboard.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                    <div className="text-4xl mb-4">🧠</div>
                    <h3 className="text-xl font-bold mb-2">Create & Host</h3>
                    <p className="text-gray-600">Design your own custom quizzes. Choose your topics, set time limits, and host your own game night.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                    <div className="text-4xl mb-4">⚡</div>
                    <h3 className="text-xl font-bold mb-2">No Account Needed</h3>
                    <p className="text-gray-600">Jump straight into the action. Zero friction — you don't even need an account to host a game or join your friends!</p>
                </div>
            </div>
        </div>
    );
}


// Request helper demo
import { apiClient, fetchCsrfToken } from '~/utils/api';

// Example: Logging in
async function handleLogin(email: String, password: String) {
    // 1. Get the CSRF Cookie before authenticating
    await fetchCsrfToken();
    
    // 2. Perform the Login Request
    const response = await apiClient('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
    
    if (response.ok) {
        console.log("Logged in!");
    }
}

// Example: Fetching the authenticated user (GET)
async function getUser() {
    const response = await apiClient('/api/user');
    const user = await response.json();
}