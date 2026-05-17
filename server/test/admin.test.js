import { describe, it, expect } from 'vitest';
import request from 'supertest';
import {
    app, registerAndToken, promoteToAdmin, userFixtures, createArticle,
} from './helpers.js';

describe('Admin gating', () => {
    it('requires authentication', async () => {
        const res = await request(app()).get('/admin/stats');
        expect(res.status).toBe(401);
    });

    it('refuses non-admin users', async () => {
        const { token } = await registerAndToken();
        const res = await request(app()).get('/admin/stats').set('x-authorization', token);
        expect(res.status).toBe(403);
    });

    it('allows freshly promoted admins on the next request', async () => {
        const { token, user } = await registerAndToken();
        await promoteToAdmin(user._id);
        const res = await request(app()).get('/admin/stats').set('x-authorization', token);
        expect(res.status).toBe(200);
    });

    it('refuses admin access after role is revoked, even with the same token', async () => {
        const { token, user } = await registerAndToken();
        await promoteToAdmin(user._id);
        await request(app()).get('/admin/stats').set('x-authorization', token).expect(200);

        const { default: User } = await import('../models/User.js');
        await User.updateOne({ _id: user._id }, { role: 'user' });

        const after = await request(app()).get('/admin/stats').set('x-authorization', token);
        expect(after.status).toBe(403);
    });
});

describe('Admin endpoints', () => {
    it('returns aggregate stats', async () => {
        const { token, user } = await registerAndToken();
        await promoteToAdmin(user._id);
        await createArticle(token);

        const res = await request(app()).get('/admin/stats').set('x-authorization', token);
        expect(res.status).toBe(200);
        expect(res.body.users.total).toBe(1);
        expect(res.body.articles.total).toBe(1);
    });

    it('lists users with pagination', async () => {
        const { token, user } = await registerAndToken();
        await promoteToAdmin(user._id);
        await registerAndToken(userFixtures.secondary);
        await registerAndToken(userFixtures.tertiary);

        const res = await request(app()).get('/admin/users').set('x-authorization', token);
        expect(res.status).toBe(200);
        expect(res.body.total).toBe(3);
    });

    it('changes another user\'s role', async () => {
        const { token, user } = await registerAndToken();
        await promoteToAdmin(user._id);
        const { user: other } = await registerAndToken(userFixtures.secondary);

        const res = await request(app())
            .patch(`/admin/users/${other._id}/role`)
            .set('x-authorization', token)
            .send({ role: 'admin' });
        expect(res.status).toBe(200);
        expect(res.body.role).toBe('admin');
    });

    it('refuses to change the caller\'s own role', async () => {
        const { token, user } = await registerAndToken();
        await promoteToAdmin(user._id);

        const res = await request(app())
            .patch(`/admin/users/${user._id}/role`)
            .set('x-authorization', token)
            .send({ role: 'user' });
        expect(res.status).toBe(400);
    });

    it('deletes a user and cascades their content', async () => {
        const { token, user } = await registerAndToken();
        await promoteToAdmin(user._id);
        const { token: otherToken, user: other } = await registerAndToken(userFixtures.secondary);
        await createArticle(otherToken, { title: 'Will be cascaded' });

        const res = await request(app())
            .delete(`/admin/users/${other._id}`)
            .set('x-authorization', token);
        expect(res.status).toBe(200);

        const list = await request(app()).get('/articles');
        expect(list.body.articles).toHaveLength(0);
    });

    it('deletes any article regardless of owner', async () => {
        const { token: adminToken, user: admin } = await registerAndToken();
        await promoteToAdmin(admin._id);
        const { token: ownerToken } = await registerAndToken(userFixtures.secondary);
        const { body: article } = await createArticle(ownerToken);

        const res = await request(app())
            .delete(`/admin/articles/${article._id}`)
            .set('x-authorization', adminToken);
        expect(res.status).toBe(200);
    });

    it('refuses to feature a draft article', async () => {
        const { token, user } = await registerAndToken();
        await promoteToAdmin(user._id);
        const { body: draft } = await createArticle(token, { status: 'draft' });

        const res = await request(app())
            .patch(`/admin/articles/${draft._id}/featured`)
            .set('x-authorization', token);
        expect(res.status).toBe(400);
    });

    it('toggles featured on a published article', async () => {
        const { token, user } = await registerAndToken();
        await promoteToAdmin(user._id);
        const { body: article } = await createArticle(token);

        const on = await request(app())
            .patch(`/admin/articles/${article._id}/featured`)
            .set('x-authorization', token);
        expect(on.body.featured).toBe(true);

        const off = await request(app())
            .patch(`/admin/articles/${article._id}/featured`)
            .set('x-authorization', token);
        expect(off.body.featured).toBe(false);
    });
});
