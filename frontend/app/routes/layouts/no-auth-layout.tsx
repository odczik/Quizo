import { Outlet } from "react-router";
import { Spinner } from "~/components/Spinner";

import { useAuth } from "~/context/AuthenticationContext";
import { useNavigate } from "react-router";
import { useEffect } from "react";

export default function NoAuthLayout() {
    const { user, isLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && user) {
            navigate(-1); // Go back to the previous page if user is already authenticated
        }
    }, [isLoading, user, navigate]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Spinner size="lg" />
            </div>
        );
    }

    if (user) {
        return null;
    }

    return <Outlet />;
}
