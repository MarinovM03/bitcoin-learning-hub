import { parseApiError } from './parseApiError';
import { toast } from '../lib/toast';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

async function request<T>(method: HttpMethod, url: string, data?: unknown): Promise<T> {
    const options: RequestInit = { credentials: 'include' };

    if (method !== 'GET') {
        options.method = method;

        if (data !== undefined) {
            options.headers = {
                'Content-Type': 'application/json',
            };
            options.body = JSON.stringify(data);
        }
    }

    const hadSession = localStorage.getItem('auth') !== null;

    const response = await fetch(url, options);

    if (response.status === 204) {
        return {} as T;
    }

    let result: unknown = null;
    try {
        result = await response.json();
    } catch {
        result = null;
    }

    if (!response.ok) {
        if (response.status === 401 && hadSession) {
            toast.info('Your session has expired. Please sign in again.');
            window.dispatchEvent(new Event('auth:unauthorized'));
        }
        throw new Error(result !== null
            ? parseApiError(result)
            : `The server returned an unexpected response (${response.status}). Please try again.`);
    }

    return result as T;
}

export const get = <T>(url: string) => request<T>('GET', url);
export const post = <T>(url: string, data?: unknown) => request<T>('POST', url, data);
export const put = <T>(url: string, data?: unknown) => request<T>('PUT', url, data);
export const patch = <T>(url: string, data?: unknown) => request<T>('PATCH', url, data);
export const del = <T>(url: string, data?: unknown) => request<T>('DELETE', url, data);
