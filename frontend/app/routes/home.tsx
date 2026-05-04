import type { Route } from "./+types/home";
import { Link } from "~/components/Link";
export function meta({}: Route.MetaArgs) {
    return [
        { title: "New React Router App" },
        { name: "description", content: "Welcome to React Router!" },
    ];
}

export default function Home() {
    return (
        <div>
            <h1>Home</h1>
            <Link to="/game" variant="primary">Game</Link>
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