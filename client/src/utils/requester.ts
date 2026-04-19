import { parseApiError } from './parseApiError';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

async function request<T>(method: HttpMethod, url: string, data?: unknown): Promise<T> {
    const options: RequestInit = {};

    if (method !== 'GET') {
        options.method = method;

        if (data !== undefined) {
            options.headers = {
                'Content-Type': 'application/json',
            };
            options.body = JSON.stringify(data);
        }
    }

    const serializedAuth = localStorage.getItem('auth');

    if (serializedAuth) {
        const auth = JSON.parse(serializedAuth) as { accessToken?: string };

        if (auth.accessToken) {
            options.headers = {
                ...options.headers,
                'X-Authorization': auth.accessToken,
            };
        }
    }

    const response = await fetch(url, options);

    if (response.status === 204) {
        return {} as T;
    }

    const result = await response.json();

    if (!response.ok) {
        if (response.status === 401 && serializedAuth) {
            window.dispatchEvent(new Event('auth:unauthorized'));
        }
        throw new Error(parseApiError(result));
    }

    return result as T;
}

export const get = <T>(url: string) => request<T>('GET', url);
export const post = <T>(url: string, data?: unknown) => request<T>('POST', url, data);
export const put = <T>(url: string, data?: unknown) => request<T>('PUT', url, data);
export const del = <T>(url: string) => request<T>('DELETE', url);
