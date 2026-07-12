import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, register, login, userFixtures, registerAndToken } from './helpers.js';

describe('POST /users/register', () => {
    it('creates a user and returns an access token', async () => {
        const res = await register();
        expect(res.status).toBe(200);
        expect(res.body.accessToken).toBeTypeOf('string');
        expect(res.body.username).toBe(userFixtures.primary.username);
        expect(res.body.email).toBe(userFixtures.primary.email);
        expect(res.body).not.toHaveProperty('password');
    });

    it('rejects a duplicate email', async () => {
        await register();
        const dup = await register({ username: 'different' });
        expect(dup.status).toBe(400);
    });

    it('rejects a duplicate username', async () => {
        await register();
        const dup = await register({ email: 'different@example.com' });
        expect(dup.status).toBe(400);
    });

    it('rejects an invalid email', async () => {
        const res = await register({ email: 'not-an-email' });
        expect(res.status).toBe(400);
    });

    it('rejects a short password', async () => {
        const res = await register({ password: 'short', confirmPassword: 'short' });
        expect(res.status).toBe(400);
    });

    it('rejects mismatched password confirmation', async () => {
        const res = await register({ confirmPassword: 'different-password-1' });
        expect(res.status).toBe(400);
    });

    it('rejects a username with disallowed characters', async () => {
        const res = await register({ username: 'has space' });
        expect(res.status).toBe(400);
    });
});

describe('POST /users/login', () => {
    it('accepts the email as identifier', async () => {
        await register();
        const res = await login();
        expect(res.status).toBe(200);
        expect(res.body.accessToken).toBeTypeOf('string');
    });

    it('accepts the username as identifier', async () => {
        await register();
        const res = await login({ identifier: userFixtures.primary.username });
        expect(res.status).toBe(200);
    });

    it('returns the same 401 for unknown, locked, and wrong-password identifiers', async () => {
        await register();

        const unknown = await login({ identifier: 'nobody@nowhere.com' });
        expect(unknown.status).toBe(401);
        expect(unknown.body.message).toBe('Invalid credentials');

        for (let i = 0; i < 5; i++) {
            await login({ password: 'wrong-password' });
        }
        const locked = await login();
        expect(locked.status).toBe(401);
        expect(locked.body.message).toBe('Invalid credentials');

        const wrong = await login({ password: 'wrong-password' });
        expect(wrong.status).toBe(401);
        expect(wrong.body.message).toBe('Invalid credentials');
    });

    it('rejects an empty identifier', async () => {
        const res = await login({ identifier: '' });
        expect(res.status).toBe(400);
    });
});

describe('GET /users/profile', () => {
    it('requires authentication', async () => {
        const res = await request(app()).get('/users/profile');
        expect(res.status).toBe(401);
    });

    it('returns the current user without password fields', async () => {
        const { token, user } = await registerAndToken();
        const res = await request(app()).get('/users/profile').set('x-authorization', token);
        expect(res.status).toBe(200);
        expect(res.body._id).toBe(user._id);
        expect(res.body).not.toHaveProperty('password');
        expect(res.body).not.toHaveProperty('failedLoginAttempts');
    });
});

describe('PUT /users/profile', () => {
    it('updates the profile picture', async () => {
        const { token } = await registerAndToken();
        const res = await request(app())
            .put('/users/profile')
            .set('x-authorization', token)
            .send({ profilePicture: 'https://example.com/new.png' });
        expect(res.status).toBe(200);
        expect(res.body.profilePicture).toBe('https://example.com/new.png');
    });

    it('changes a username once but enforces the 30-day cooldown afterwards', async () => {
        const { token } = await registerAndToken();
        const first = await request(app())
            .put('/users/profile')
            .set('x-authorization', token)
            .send({ username: 'renamedone' });
        expect(first.status).toBe(200);

        const second = await request(app())
            .put('/users/profile')
            .set('x-authorization', token)
            .send({ username: 'renamedtwo' });
        expect(second.status).toBe(400);
    });

    it('rejects a username taken by another user', async () => {
        const { token } = await registerAndToken();
        await register(userFixtures.secondary);
        const res = await request(app())
            .put('/users/profile')
            .set('x-authorization', token)
            .send({ username: userFixtures.secondary.username });
        expect(res.status).toBe(400);
    });

    it('rejects a password change with mismatched confirmation', async () => {
        const { token } = await registerAndToken();
        const res = await request(app())
            .put('/users/profile')
            .set('x-authorization', token)
            .send({ password: 'new-pass-1234', confirmPassword: 'different-1234' });
        expect(res.status).toBe(400);
    });

    it('rejects a password change without the current password', async () => {
        const { token } = await registerAndToken();
        const res = await request(app())
            .put('/users/profile')
            .set('x-authorization', token)
            .send({ password: 'new-pass-1234', confirmPassword: 'new-pass-1234' });
        expect(res.status).toBe(400);
    });

    it('rejects a password change with a wrong current password', async () => {
        const { token } = await registerAndToken();
        const res = await request(app())
            .put('/users/profile')
            .set('x-authorization', token)
            .send({
                password: 'new-pass-1234',
                confirmPassword: 'new-pass-1234',
                currentPassword: 'wrong-password',
            });
        expect(res.status).toBe(400);
    });

    it('changes the password when the current password is provided', async () => {
        const { token } = await registerAndToken();
        const res = await request(app())
            .put('/users/profile')
            .set('x-authorization', token)
            .send({
                password: 'new-pass-1234',
                confirmPassword: 'new-pass-1234',
                currentPassword: userFixtures.primary.password,
            });
        expect(res.status).toBe(200);

        const newLogin = await login({ password: 'new-pass-1234' });
        expect(newLogin.status).toBe(200);
    });

    it('rejects an email change without the current password', async () => {
        const { token } = await registerAndToken();
        const res = await request(app())
            .put('/users/profile')
            .set('x-authorization', token)
            .send({ email: 'changed@example.com' });
        expect(res.status).toBe(400);
    });

    it('changes the email when the current password is provided', async () => {
        const { token } = await registerAndToken();
        const res = await request(app())
            .put('/users/profile')
            .set('x-authorization', token)
            .send({ email: 'changed@example.com', currentPassword: userFixtures.primary.password });
        expect(res.status).toBe(200);
        expect(res.body.email).toBe('changed@example.com');
    });

    it('allows username and picture changes without the current password', async () => {
        const { token } = await registerAndToken();
        const res = await request(app())
            .put('/users/profile')
            .set('x-authorization', token)
            .send({
                username: 'freshname',
                profilePicture: 'https://example.com/pic.png',
                email: userFixtures.primary.email,
            });
        expect(res.status).toBe(200);
        expect(res.body.username).toBe('freshname');
    });
});

describe('POST /users/logout', () => {
    it('returns success even without an auth token', async () => {
        const res = await request(app()).post('/users/logout');
        expect(res.status).toBe(200);
    });
});

describe('GET /users/:userId/public', () => {
    it('returns the public profile of an existing user', async () => {
        const { user } = await registerAndToken();
        const res = await request(app()).get(`/users/${user._id}/public`);
        expect(res.status).toBe(200);
        expect(res.body.username).toBe(user.username);
        expect(res.body).not.toHaveProperty('email');
        expect(res.body).not.toHaveProperty('password');
    });

    it('returns 404 for an invalid id', async () => {
        const res = await request(app()).get('/users/not-an-id/public');
        expect(res.status).toBe(400);
    });
});
