import { Outlet } from "react-router";

export default function GameLayout() {
    return (
        // The game layout will take up the full screen and usually has a specific background color/theme
        <div className="min-h-screen bg-indigo-600 text-white flex flex-col">
            <main className="flex-1 w-full h-full flex flex-col items-center justify-center relative overflow-hidden">
                {/* Render the specific game view (e.g. waiting lobby, question view, etc.) */}
                <Outlet />
            </main>
        </div>
    );
}
