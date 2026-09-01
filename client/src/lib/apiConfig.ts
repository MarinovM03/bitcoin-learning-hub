const configured = import.meta.env.VITE_API_URL?.trim();

const DEFAULT_API_URL = 'http://localhost:5000';

if (!configured && import.meta.env.PROD) {
    throw new Error(
        'VITE_API_URL is not set. Define it in the client environment before building for production.'
    );
}

const resolve = (value: string): string => {
    let parsed: URL;
    try {
        parsed = new URL(value);
    } catch {
        throw new Error(
            `VITE_API_URL is not a valid URL: "${value}". Use an absolute origin such as https://api.example.com.`
        );
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new Error(
            `VITE_API_URL must use http or https, but got "${parsed.protocol}".`
        );
    }

    return parsed.origin + parsed.pathname.replace(/\/$/, '');
};

export const API_BASE_URL = resolve(configured || DEFAULT_API_URL);
