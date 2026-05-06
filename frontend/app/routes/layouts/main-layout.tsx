import { Outlet } from "react-router";
import Navbar from "~/components/layouts/Navbar";

export default function MainLayout() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-100 font-sans text-gray-900">
            {/* GLOBAL NAVBAR */}
            <Navbar />

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
