import { Button } from "~/components/Button";
import { Input } from "~/components/Input";
import api from "~/utils/api";

export default function Login() {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // api.fetchCsrfToken().then(() => {
        //     console.log("CSRF token fetched successfully. Proceeding with login...");
        // }).catch(err => {
        //     console.error("Failed to fetch CSRF token:", err);
        // });

        api.apiClient("/api/user/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: "testuser",
                password: "password123"
            })
        }).then(res => {
            if (res.ok) {
                console.log("Login successful!");
            }
        }).catch(err => {
            console.error("Login failed:", err);
        });
    };

    return (
        <div className="flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Login to Quizo</h2>
                <form className="space-y-4" onSubmit={(e) => handleSubmit(e)}>
                    <Input 
                        type="text" 
                        placeholder="Username" 
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                    <Input 
                        type="password" 
                        placeholder="Password" 
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                    <Button 
                        type="submit" 
                        variant="primary" 
                        className="w-full"
                    >Login</Button>
                </form>
                <p className="mt-4 text-center text-gray-600">Don't have an account? <a href="/register" className="text-blue-500 hover:underline">Register here</a></p>
            </div>
        </div>
    );
}