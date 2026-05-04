import type { Route } from "./+types/home";
import { Link } from "~/components/Link";
export function meta({}: Route.MetaArgs) {
    return [
        { title: "New React Router App" },
        { name: "description", content: "Welcome to React Router!" },
    ];
}

export default function Home() {
    return (
        <div>
            <h1>Home</h1>
            <Link to="/game" variant="primary">Game</Link>
        </div>
    );
}
