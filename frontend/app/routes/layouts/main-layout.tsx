import { Outlet } from "react-router";
import { Link } from '../../components/Link';
import { Button } from "~/components/Button";

export default function MainLayout() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-100 font-sans text-gray-900">
            {/* GLOBAL NAVBAR */}
            <header className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
                <nav className="flex justify-between items-center max-w-7xl mx-auto">
                    <Link to="/" className="text-2xl font-bold text-black hover:none">Quizo</Link>
                    <ul className="flex gap-6 items-center">
                        <li><Link to="/demo" variant="subtle">Components Library Demo</Link></li>
                        <li><Button variant="primary">Login</Button></li>
                    </ul>
                </nav>
            </header>

            {/* PAGE CONTENT */}
            <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">
                <Outlet />
            </main>

            {/* GLOBAL FOOTER */}
            <footer className="bg-white border-t border-gray-200 p-6 text-center mt-auto text-gray-500 text-sm">
                <p>&copy; {new Date().getFullYear()} Quizo. All rights reserved.</p>
            </footer>
        </div>
    );
}
