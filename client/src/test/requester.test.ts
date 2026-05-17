import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as requester from '../utils/requester';

const okJson = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });

describe('requester', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('sends a GET without a body or method override', async () => {
        const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(okJson({ ok: true }));
        await requester.get('/test');
        const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit | undefined];
        expect(init?.method).toBeUndefined();
        expect(init?.body).toBeUndefined();
    });

    it('serialises body and sets json content type on POST', async () => {
        const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(okJson({ ok: true }));
        await requester.post('/test', { hello: 'world' });
        const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
        expect(init.method).toBe('POST');
        expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json');
        expect(init.body).toBe(JSON.stringify({ hello: 'world' }));
    });

    it('attaches X-Authorization when an auth token is in localStorage', async () => {
        localStorage.setItem('auth', JSON.stringify({ accessToken: 'token-abc' }));
        const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(okJson({ ok: true }));
        await requester.get('/test');
        const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
        expect((init.headers as Record<string, string>)['X-Authorization']).toBe('token-abc');
    });

    it('dispatches auth:unauthorized when a stored token gets a 401', async () => {
        localStorage.setItem('auth', JSON.stringify({ accessToken: 'token-abc' }));
        const listener = vi.fn();
        window.addEventListener('auth:unauthorized', listener);
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(okJson({ message: 'nope' }, 401));

        await expect(requester.get('/test')).rejects.toThrow();
        expect(listener).toHaveBeenCalledOnce();
        window.removeEventListener('auth:unauthorized', listener);
    });

    it('does not dispatch auth:unauthorized on a 401 when no token is stored', async () => {
        const listener = vi.fn();
        window.addEventListener('auth:unauthorized', listener);
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(okJson({ message: 'nope' }, 401));

        await expect(requester.get('/test')).rejects.toThrow();
        expect(listener).not.toHaveBeenCalled();
        window.removeEventListener('auth:unauthorized', listener);
    });

    it('throws an error with the server message on non-2xx responses', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(okJson({ message: 'No permission' }, 403));
        await expect(requester.get('/test')).rejects.toThrow('No permission');
    });

    it('returns an empty object on 204 No Content', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response(null, { status: 204 }));
        await expect(requester.del('/test')).resolves.toEqual({});
    });
});
