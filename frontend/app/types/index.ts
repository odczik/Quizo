export interface User {
    id: string;
    username: string;
    email: string;
    createdAt: string;
    isActive: boolean;
}

export interface ApiResponse<T> {
    data: T;
    error?: string;
    status: number;
}
