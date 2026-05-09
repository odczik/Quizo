import { createContext, useContext, useState, useEffect } from 'react';
import api from '~/utils/api'; // The apiClient we just updated

interface User {
    id: number;
    name: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    checkAuth: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthenticationProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuth = async () => {
        setIsLoading(true);
        try {
            const response = await api.apiClient('/api/user/profile');
            if (response.ok) {
                const data = await response.json();
                setUser(data);
            } else {
                setUser(null);
            }
        } catch (error) {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    // Check auth status when the app loads
    useEffect(() => {
        checkAuth();
    }, []);

    const logout = async () => {
        // Optimistically set user to null so the UI updates instantly
        setUser(null);
        try {
            await api.apiClient('/api/user/logout', { method: 'POST' });
        } catch (error) {
            console.error("Logout failed:", error);
            checkAuth(); // Re-check auth status in case logout failed
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, checkAuth, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthenticationProvider');
    }
    return context;
}