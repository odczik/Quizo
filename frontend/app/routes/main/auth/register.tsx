import { Button } from "~/components/Button";
import { Input } from "~/components/Input";

export default function Register() {
    return (
        <div className="flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Register for Quizo</h2>
                <form className="space-y-4">
                    <Input type="text" placeholder="Username" className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <Input type="password" placeholder="Password" className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <Button type="submit" variant="primary" className="w-full">Register</Button>
                </form>
                <p className="mt-4 text-center text-gray-600">Already have an account? <a href="/login" className="text-blue-500 hover:underline">Login here</a></p>
            </div>
        </div>
    );
}