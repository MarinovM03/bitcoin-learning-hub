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

    it('sends the session cookie with every request and never a token header', async () => {
        localStorage.setItem('auth', JSON.stringify({ _id: 'u1', expiresAt: Date.now() + 60_000 }));
        const fetchSpy = vi.spyOn(globalThis, 'fetch')
            .mockResolvedValueOnce(okJson({ ok: true }))
            .mockResolvedValueOnce(okJson({ ok: true }));

        await requester.get('/test');
        await requester.post('/test', { hello: 'world' });

        for (const call of fetchSpy.mock.calls) {
            const [, init] = call as [string, RequestInit];
            expect(init.credentials).toBe('include');
            expect(Object.keys(init.headers ?? {})).not.toContain('X-Authorization');
        }
    });

    it('dispatches auth:unauthorized when a stored session gets a 401', async () => {
        localStorage.setItem('auth', JSON.stringify({ _id: 'u1', expiresAt: Date.now() + 60_000 }));
        const listener = vi.fn();
        window.addEventListener('auth:unauthorized', listener);
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(okJson({ message: 'nope' }, 401));

        await expect(requester.get('/test')).rejects.toThrow();
        expect(listener).toHaveBeenCalledOnce();
        window.removeEventListener('auth:unauthorized', listener);
    });

    it('does not dispatch auth:unauthorized on a 401 when no session is stored', async () => {
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

    it('throws a readable error when an error response is not JSON', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
            new Response('<html>Bad Gateway</html>', {
                status: 502,
                headers: { 'Content-Type': 'text/html' },
            }),
        );
        await expect(requester.get('/test')).rejects.toThrow(/unexpected response \(502\)/);
    });
});
