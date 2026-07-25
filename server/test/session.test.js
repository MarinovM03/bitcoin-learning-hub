import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, registerAndToken, userFixtures } from './helpers.js';

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
