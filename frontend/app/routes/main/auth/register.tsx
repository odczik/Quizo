import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "~/components/Button";
import { Input } from "~/components/Input";
import { Link } from "~/components/Link";
import api from "~/utils/api";

import { useNotification } from "~/context/NotificationContext";

export default function Register() {
    const { notify } = useNotification();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        api.apiClient("/api/user/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name,
                email: email,
                password: password,
                password_confirmation: passwordConfirmation
            })
        }).then(res => {
            if (res.ok) {
                notify("Registration successful! You can now login.", "success");
                navigate("/login");
            }
        }).catch(err => {
            console.error("Registration failed:", err);
            notify("Registration failed. Please try again. Error: " + err.message, "error");
        });
    };

    return (
        <div className="flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
                <form className="space-y-4" onSubmit={(e) => handleSubmit(e)}>
                    <Input 
                        type="text" 
                        placeholder="Name" 
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
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
                    <Input 
                        type="password" 
                        placeholder="Confirm Password" 
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        value={passwordConfirmation}
                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                    />
                    <Button 
                        type="submit" 
                        variant="primary" 
                        className="w-full"
                    >Register</Button>
                </form>
                <p className="mt-4 text-center text-gray-600">Already have an account? <Link to="/login" className="text-blue-500 hover:underline">Login here</Link></p>
            </div>
        </div>
    );
}