// This URL should point to your Laravel backend (e.g., http://localhost:8000)
// You can also set this in a .env file as VITE_API_URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Extracts a cookie value by name from the document.
 * Laravel's Sanctum sets an XSRF-TOKEN cookie that we must return in the X-XSRF-TOKEN header.
 */
function getCookie(name: string): string | undefined {
    // Return early if we are running on the server (SSR)
    if (typeof document === 'undefined') return undefined;
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return undefined;
}

/**
 * Initializes the CSRF cookie.
 * You should call this right before you submit a login/register request, 
 * or when the app mounts, to ensure you have a fresh CSRF token from Laravel.
 */
export async function fetchCsrfToken() {
    return fetch(`${API_BASE_URL}/sanctum/csrf-cookie`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
        credentials: 'include', // Crucial: tells the browser to store the cookie
    });
}

/**
 * A generalized fetch helper built for Laravel Sanctum authentication.
 * It automatically adds the CSRF token to mutations and sets up credentials.
 */
export async function apiClient(endpoint: string, options: RequestInit & { _retry?: boolean } = {}) {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const headers = new Headers(options.headers || {});
    
    // Laravel expects this to know it should return JSON (e.g., for validation errors)
    headers.set('Accept', 'application/json');

    // If we're sending JSON, set the Content-Type
    if (options.body && typeof options.body === 'string' && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    const method = (options.method || 'GET').toUpperCase();
    
    // For mutating requests, Laravel requires the X-XSRF-TOKEN header
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        const token = getCookie('XSRF-TOKEN');
        if (token) {
            // Laravel's XSRF-TOKEN cookie is URL-encoded, so we have to decode it
            headers.set('X-XSRF-TOKEN', decodeURIComponent(token));
        }
    }

    const config: RequestInit = {
        ...options,
        headers,
        // Crucial: tells the browser to include our session & CSRF cookies in the request
        credentials: 'include', 
    };

    const response = await fetch(url, config);

    // Global Error Handling (examples)
    if (!response.ok) {
        // CSRF Token Mismatch / Session Expired
        if (response.status === 419 && !options._retry) {
            console.warn('CSRF token mismatch. Refreshing token and retrying...');
            await fetchCsrfToken();
            return apiClient(endpoint, { ...options, _retry: false }); // Avoid infinite retry loops
        }
        
        // Unauthenticated
        if (response.status === 401) {
            console.warn('Unauthenticated. Redirecting to login...');
            // Handle auth redirection natively or via state
        }
    }

    return response;
}

export default {
    getCookie,
    fetchCsrfToken,
    apiClient,
};