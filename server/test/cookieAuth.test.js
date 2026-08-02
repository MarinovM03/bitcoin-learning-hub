import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, register, login, registerAndToken, createArticle, sessionCookie } from './helpers.js';

const ALLOWED_ORIGIN = 'http://localhost:5173';
const FOREIGN_ORIGIN = 'https://attacker.example';

const setCookieHeader = (res) => (res.headers['set-cookie'] || []).join('; ');

describe('session cookie attributes', () => {
    it('issues the JWT as an httpOnly, path-scoped, SameSite cookie', async () => {
        const res = await register();
        const header = setCookieHeader(res);

        expect(header).toMatch(/accessToken=/);
        expect(header).toMatch(/HttpOnly/i);
        expect(header).toMatch(/SameSite=Lax/i);
        expect(header).toMatch(/Path=\//i);
    });

    it('keeps the token out of the response body on login', async () => {
        await register();
        const res = await login();

        expect(res.status).toBe(200);
        expect(res.body).not.toHaveProperty('accessToken');
        expect(res.body).toHaveProperty('expiresAt');
        expect(res.body.expiresAt).toBeGreaterThan(Date.now());
    });

    it('clears the cookie on logout', async () => {
        const { token } = await registerAndToken();

        const res = await request(app()).post('/users/logout').set('Cookie', token);
        expect(res.status).toBe(200);
        expect(setCookieHeader(res)).toMatch(/accessToken=;/);
    });

    it('clears the cookie when the account is deleted', async () => {
        const { token } = await registerAndToken();

        const res = await request(app())
            .delete('/users/me')
            .set('Cookie', token)
            .send({ password: 'supersecret1' });
        expect(res.status).toBe(200);
        expect(setCookieHeader(res)).toMatch(/accessToken=;/);
    });

    it('authenticates a follow-up request using only the cookie', async () => {
        const res = await register();
        const profile = await request(app())
            .get('/users/profile')
            .set('Cookie', sessionCookie(res));

        expect(profile.status).toBe(200);
        expect(profile.body.username).toBe('martin');
    });
});

describe('origin checks on state-changing requests', () => {
    it('rejects a session-bearing write from an unrecognised origin', async () => {
        const { token } = await registerAndToken();

        const res = await createArticle(token).set('Origin', FOREIGN_ORIGIN);
        expect(res.status).toBe(403);
        expect(res.body.message).toMatch(/origin/i);
    });

    it('accepts a write from the configured client origin', async () => {
        const { token } = await registerAndToken();

        const res = await createArticle(token).set('Origin', ALLOWED_ORIGIN);
        expect(res.status).toBe(201);
    });

    it('rejects a write the browser itself labels cross-site', async () => {
        const { token } = await registerAndToken();

        const res = await createArticle(token).set('Sec-Fetch-Site', 'cross-site');
        expect(res.status).toBe(403);
    });

    it('falls back to the referer when no origin header is present', async () => {
        const { token } = await registerAndToken();

        const foreign = await createArticle(token).set('Referer', `${FOREIGN_ORIGIN}/attack.html`);
        expect(foreign.status).toBe(403);

        const own = await createArticle(token).set('Referer', `${ALLOWED_ORIGIN}/articles/create`);
        expect(own.status).toBe(201);
    });

    it('leaves reads untouched', async () => {
        const { token } = await registerAndToken();

        const res = await request(app())
            .get('/users/profile')
            .set('Cookie', token)
            .set('Origin', FOREIGN_ORIGIN);
        expect(res.status).toBe(200);
    });

    it('does not block anonymous requests that carry no session', async () => {
        const res = await request(app())
            .post('/users/login')
            .set('Origin', FOREIGN_ORIGIN)
            .send({ identifier: 'nobody@example.com', password: 'whatever123' });
        expect(res.status).toBe(401);
    });
});
