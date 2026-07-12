import { describe, it, expect } from 'vitest';
import request from 'supertest';
import crypto from 'node:crypto';
import { app, register, registerAndToken, login, userFixtures } from './helpers.js';
import User from '../models/User.js';
import PasswordResetToken from '../models/PasswordResetToken.js';

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const issueToken = async (userId, { expired = false } = {}) => {
    const rawToken = crypto.randomBytes(32).toString('hex');
    await PasswordResetToken.create({
        _ownerId: userId,
        tokenHash: hashToken(rawToken),
        expiresAt: new Date(Date.now() + (expired ? -60_000 : 60_000)),
    });
    return rawToken;
};

describe('POST /users/forgot-password', () => {
    it('returns a uniform response for unknown emails', async () => {
        const res = await request(app())
            .post('/users/forgot-password')
            .send({ email: 'nobody@example.com' });
        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/if an account exists/i);
    });

    it('stores a reset token for a known email', async () => {
        await register();
        const user = await User.findOne({ email: userFixtures.primary.email });

        const res = await request(app())
            .post('/users/forgot-password')
            .send({ email: userFixtures.primary.email });
        expect(res.status).toBe(200);

        const tokens = await PasswordResetToken.find({ _ownerId: user._id });
        expect(tokens).toHaveLength(1);
        expect(tokens[0].expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('replaces older tokens on repeat requests', async () => {
        await register();
        const user = await User.findOne({ email: userFixtures.primary.email });

        await request(app()).post('/users/forgot-password').send({ email: userFixtures.primary.email });
        await request(app()).post('/users/forgot-password').send({ email: userFixtures.primary.email });

        const tokens = await PasswordResetToken.find({ _ownerId: user._id });
        expect(tokens).toHaveLength(1);
    });
});

describe('POST /users/reset-password', () => {
    it('rejects an unknown token', async () => {
        const res = await request(app())
            .post('/users/reset-password')
            .send({ token: 'not-a-real-token', password: 'newpassword1', confirmPassword: 'newpassword1' });
        expect(res.status).toBe(400);
    });

    it('rejects an expired token', async () => {
        await register();
        const user = await User.findOne({ email: userFixtures.primary.email });
        const rawToken = await issueToken(user._id, { expired: true });

        const res = await request(app())
            .post('/users/reset-password')
            .send({ token: rawToken, password: 'newpassword1', confirmPassword: 'newpassword1' });
        expect(res.status).toBe(400);
    });

    it('rejects mismatched passwords', async () => {
        await register();
        const user = await User.findOne({ email: userFixtures.primary.email });
        const rawToken = await issueToken(user._id);

        const res = await request(app())
            .post('/users/reset-password')
            .send({ token: rawToken, password: 'newpassword1', confirmPassword: 'different1' });
        expect(res.status).toBe(400);
    });

    it('resets the password, signs out existing sessions, and is single-use', async () => {
        const { token: oldJwt } = await registerAndToken();
        const user = await User.findOne({ email: userFixtures.primary.email });
        const rawToken = await issueToken(user._id);

        const res = await request(app())
            .post('/users/reset-password')
            .send({ token: rawToken, password: 'brandnewpass1', confirmPassword: 'brandnewpass1' });
        expect(res.status).toBe(200);

        const oldLogin = await login();
        expect(oldLogin.status).toBe(401);

        const newLogin = await login({ password: 'brandnewpass1' });
        expect(newLogin.status).toBe(200);

        const staleSession = await request(app())
            .get('/users/profile')
            .set('x-authorization', oldJwt);
        expect(staleSession.status).toBe(401);

        const reuse = await request(app())
            .post('/users/reset-password')
            .send({ token: rawToken, password: 'anotherpass1', confirmPassword: 'anotherpass1' });
        expect(reuse.status).toBe(400);
    });

    it('clears an active login lockout', async () => {
        await register();
        const user = await User.findOne({ email: userFixtures.primary.email });
        await User.updateOne(
            { _id: user._id },
            { failedLoginAttempts: 0, lockedUntil: new Date(Date.now() + 60_000) },
        );
        const rawToken = await issueToken(user._id);

        const res = await request(app())
            .post('/users/reset-password')
            .send({ token: rawToken, password: 'unlockedpass1', confirmPassword: 'unlockedpass1' });
        expect(res.status).toBe(200);

        const loginRes = await login({ password: 'unlockedpass1' });
        expect(loginRes.status).toBe(200);
    });
});
