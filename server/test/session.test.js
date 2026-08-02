import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, registerAndToken, userFixtures, login, sessionCookie } from './helpers.js';

describe('Session revocation via tokenVersion', () => {
    it('rejects a token after the user logs out', async () => {
        const { token } = await registerAndToken();

        await request(app()).get('/users/profile').set('Cookie', token).expect(200);
        await request(app()).post('/users/logout').set('Cookie', token).expect(200);

        const after = await request(app()).get('/users/profile').set('Cookie', token);
        expect(after.status).toBe(401);
    });

    it('rejects all previous tokens after password change', async () => {
        const { token } = await registerAndToken();

        await request(app())
            .put('/users/profile')
            .set('Cookie', token)
            .send({
                password: 'rotated-password-1',
                confirmPassword: 'rotated-password-1',
                currentPassword: userFixtures.primary.password,
            })
            .expect(200);

        const after = await request(app()).get('/users/profile').set('Cookie', token);
        expect(after.status).toBe(401);
    });

    it('rejects a syntactically valid but unsigned-by-us token', async () => {
        const res = await request(app())
            .get('/users/profile')
            .set('Cookie', 'accessToken=this.is.not-a-real-token');
        expect(res.status).toBe(401);
    });

    it('rejects a token whose user no longer exists', async () => {
        const { token, user } = await registerAndToken();
        const { default: User } = await import('../models/User.js');
        await User.deleteOne({ _id: user._id });

        const res = await request(app()).get('/users/profile').set('Cookie', token);
        expect(res.status).toBe(401);
    });
});

describe('Per-device logout', () => {
    const twoSessions = async () => {
        const { token: first } = await registerAndToken();
        const second = sessionCookie(await login());
        return { first, second };
    };

    it('leaves other devices signed in when one logs out', async () => {
        const { first, second } = await twoSessions();

        await request(app()).post('/users/logout').set('Cookie', first).expect(200);

        const revoked = await request(app()).get('/users/profile').set('Cookie', first);
        expect(revoked.status).toBe(401);

        const survivor = await request(app()).get('/users/profile').set('Cookie', second);
        expect(survivor.status).toBe(200);
    });

    it('still drops every device when the password changes', async () => {
        const { first, second } = await twoSessions();

        await request(app())
            .put('/users/profile')
            .set('Cookie', first)
            .send({
                password: 'rotated-password-1',
                confirmPassword: 'rotated-password-1',
                currentPassword: userFixtures.primary.password,
            })
            .expect(200);

        const other = await request(app()).get('/users/profile').set('Cookie', second);
        expect(other.status).toBe(401);
    });

    it('does not let a logged-out session be replayed after another logout', async () => {
        const { first, second } = await twoSessions();

        await request(app()).post('/users/logout').set('Cookie', first).expect(200);
        await request(app()).post('/users/logout').set('Cookie', second).expect(200);

        const replay = await request(app()).get('/users/profile').set('Cookie', first);
        expect(replay.status).toBe(401);
    });
});
