import type { Route } from "./+types/home";
import { Button } from '../components/Button';
import { useToggle } from '../hooks/useToggle';
import { formatDate } from '../utils/formatters';
import type { User } from '../types';

export function meta({}: Route.MetaArgs) {
    return [
        { title: "New React Router App" },
        { name: "description", content: "Welcome to React Router!" },
    ];
}

export default function Home() {
    // 1. Showcase the custom hook
    const [isVisible, toggleVisible] = useToggle(false);

    // 2. Showcase the utility function
    const todayFormatted = formatDate(new Date());

    // 3. Showcase the TypeScript type
    const dummyUser: User = {
        id: "1",
        username: "johndoe",
        email: "john@example.com",
        createdAt: new Date().toISOString(),
        isActive: true
    };

    return (
        <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
            <h1>React Patterns Showcase</h1>
            
            <div style={{ marginBottom: '1.5rem' }}>
                <h2>1. Utility Function</h2>
                <p>Today is: <strong>{todayFormatted}</strong></p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <h2>2. Custom Hook & Component</h2>
                <Button variant="primary" onClick={toggleVisible}>
                    {isVisible ? "Hide" : "Show"} User Details
                </Button>
                
                {isVisible && (
                    <div style={{ 
                        marginTop: '1rem', 
                        padding: '1rem', 
                        border: '1px solid #ccc', 
                        borderRadius: '4px',
                        backgroundColor: '#363636'
                    }}>
                        <p><strong>Username:</strong> {dummyUser.username}</p>
                        <p><strong>Email:</strong> {dummyUser.email}</p>
                        <p><strong>Account created:</strong> {formatDate(dummyUser.createdAt)} ({dummyUser.createdAt})</p>
                    </div>
                )}
            </div>
        </div>
    );
}
