import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, registerAndToken } from './helpers.js';

describe('Mongo sanitisation', () => {
    it('strips operator keys from the request body before reaching the handler', async () => {
        const res = await request(app())
            .post('/users/login')
            .send({ identifier: { $ne: '' }, password: { $ne: '' } });
        expect(res.status).toBe(400);
    });

    it('strips dotted keys from the request body', async () => {
        const res = await request(app())
            .post('/users/login')
            .send({ 'a.b': 'evil', identifier: 'nobody@nowhere.com', password: 'whatever' });
        expect(res.status).toBe(401);
    });
});

describe('Validation', () => {
    it('returns 400 with a message when zod fails', async () => {
        const res = await request(app()).post('/users/register').send({ email: 'bad' });
        expect(res.status).toBe(400);
        expect(res.body.message).toBeTypeOf('string');
    });

    it('returns 400 for an invalid object id in a route param', async () => {
        const res = await request(app()).get('/articles/not-an-objectid');
        expect(res.status).toBe(400);
    });
});

describe('Auth middleware', () => {
    it('treats a malformed token as missing', async () => {
        const res = await request(app())
            .get('/users/profile')
            .set('x-authorization', 'totally-malformed');
        expect(res.status).toBe(401);
    });

    it('treats no token as missing', async () => {
        const res = await request(app()).get('/users/profile');
        expect(res.status).toBe(401);
    });

    it('attaches the user when the token is valid', async () => {
        const { token, user } = await registerAndToken();
        const res = await request(app()).get('/users/profile').set('x-authorization', token);
        expect(res.body._id).toBe(user._id);
    });
});

describe('Error handler', () => {
    it('returns a JSON 404 for unknown routes', async () => {
        const res = await request(app()).get('/this-route-does-not-exist');
        expect(res.status).toBe(404);
        expect(res.body.message).toBeTypeOf('string');
    });
});
