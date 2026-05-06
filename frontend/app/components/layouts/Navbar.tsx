import { Link } from "~/components/Link";
import { Button } from "~/components/Button";

export default function Navbar() {
    return (
        <header className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
            <nav className="flex justify-between items-center max-w-7xl mx-auto">
                <Link to="/" className="text-2xl font-bold text-black hover:none">Quizo</Link>
                <ul className="flex gap-6 items-center">
                    <li><Link to="/demo" variant="subtle">Components Library Demo</Link></li>
                    <li><Link to="/browse" className="hover:underline">Browse Quizzes</Link></li>
                    <li><Button variant="secondary" onClick={() => location.href = "/login"}>Login</Button></li>
                    <li><Button variant="primary" onClick={() => location.href = "/game"}>Join Game</Button></li>
                </ul>
            </nav>
        </header>
    )
}