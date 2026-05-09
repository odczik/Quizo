import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "~/components/Button";
import { Input } from "~/components/Input";
import api from "~/utils/api";

import { useAuth } from "~/context/AuthenticationContext";
import { useNotification } from "~/context/NotificationContext";

export default function Login() {
    const { checkAuth } = useAuth();
    const { notify } = useNotification();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        api.apiClient("/api/user/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            }),
            _redirect: false // Custom flag to prevent multiple redirects in case of multiple 401 responses
        }).then(async res => {
            if (res.ok) {
                await checkAuth(); // Refresh auth state after successful login
                notify("Login successful!", "success");
                navigate("/");
            } else {
                const data = await res.json();
                throw new Error(data.message || "Something went wrong during login.");
            }
        }).catch(err => {
            console.error("Login failed:", err);
            notify("Login failed. Please try again. Error: " + err.message, "error");
        }).finally(() => {
            setIsSubmitting(false);
        });
    };

    return (
        <div className="flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Login to Quizo</h2>
                <form className="space-y-4" onSubmit={(e) => handleSubmit(e)}>
                    <Input 
                        type="email" 
                        placeholder="Email" 
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Input 
                        type="password" 
                        placeholder="Password" 
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button 
                        type="submit" 
                        variant="primary" 
                        className="w-full"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Logging in..." : "Login"}
                    </Button>
                </form>
                <p className="mt-4 text-center text-gray-600">Don't have an account? <a href="/register" className="text-blue-500 hover:underline">Register here</a></p>
            </div>
        </div>
    );
}