import { Outlet } from "react-router";
import Navbar from "~/components/layouts/Navbar";
import { Spinner } from "~/components/Spinner";

import { useAuth } from "~/context/AuthenticationContext";
import { useNavigate } from "react-router";

export default function NoAuthLayout() {
    const { user, isLoading } = useAuth();
    const navigate = useNavigate();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Spinner size="lg" />
            </div>
        );
    }

    if (user) {
        navigate(-1); // Go back to the previous page if user is already authenticated
        return null;
    }

    return <Outlet />;
}
