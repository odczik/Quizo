import type { Route } from "./+types/home";
import { Button } from '../components/Button';
import { formatDate } from '../utils/formatters';
export function meta({}: Route.MetaArgs) {
    return [
        { title: "New React Router App" },
        { name: "description", content: "Welcome to React Router!" },
    ];
}

export default function Home() {
    return (
        <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
            <Button variant="primary" onClick={() => window.location.href = '/demo'}>
                Visit Component Demo Page
            </Button>
        </div>
    );
}
