import { Outlet } from "react-router";
import Navbar from "~/components/layouts/Navbar";
import { Spinner } from "~/components/Spinner";

import { useAuth } from "~/context/AuthenticationContext";

export default function ProtectedLayout() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!user) {
        window.location.href = "/login";
        return null;
    }

    return <Outlet />;
}
