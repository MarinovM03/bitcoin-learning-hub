const configured = import.meta.env.VITE_API_URL?.trim();

if (!configured && import.meta.env.PROD) {
    throw new Error(
        'VITE_API_URL is not set. Define it in the client environment before building for production.'
    );
}

export const API_BASE_URL = configured || 'http://localhost:5000';
