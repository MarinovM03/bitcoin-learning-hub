import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from './helpers.js';

describe('GET /health', () => {
    it('returns 200 and status only when the DB is connected', async () => {
        const res = await request(app()).get('/health');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ status: 'ok' });
        expect(res.body).not.toHaveProperty('uptime');
        expect(res.body).not.toHaveProperty('db');
    });
});

describe('Unknown route', () => {
    it('returns a JSON 404', async () => {
        const res = await request(app()).get('/nope');
        expect(res.status).toBe(404);
        expect(res.body.message).toContain('not found');
    });
});
