import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, registerAndToken, createArticle, userFixtures } from './helpers.js';

const toggle = (token, articleId) =>
    request(app()).post('/bookmarks').set('Cookie', token).send({ articleId });

describe('Bookmarks', () => {
    it('requires authentication', async () => {
        const res = await request(app()).get('/bookmarks');
        expect(res.status).toBe(401);
    });

    it('toggles a bookmark on and off', async () => {
        const { token } = await registerAndToken();
        const { body: article } = await createArticle(token);

        const on = await toggle(token, article._id);
        expect(on.status).toBe(201);
        expect(on.body).toEqual({ bookmarked: true });

        const off = await toggle(token, article._id);
        expect(off.status).toBe(200);
        expect(off.body).toEqual({ bookmarked: false });
    });

    it('lists the caller\'s bookmarked articles', async () => {
        const { token } = await registerAndToken();
        const { body: article } = await createArticle(token);
        await toggle(token, article._id);

        const list = await request(app()).get('/bookmarks').set('Cookie', token);
        expect(list.status).toBe(200);
        expect(list.body).toHaveLength(1);
        expect(list.body[0]._id).toBe(article._id);
    });

    it('drops bookmarks whose article is no longer published', async () => {
        const { token: author } = await registerAndToken();
        const { token: reader } = await registerAndToken(userFixtures.secondary);
        const { body: article } = await createArticle(author);
        await toggle(reader, article._id);

        const before = await request(app()).get('/bookmarks').set('Cookie', reader);
        expect(before.body).toHaveLength(1);

        const reverted = await request(app())
            .put(`/articles/${article._id}`)
            .set('Cookie', author)
            .send({ status: 'draft' });
        expect(reverted.body.status).toBe('draft');

        const after = await request(app()).get('/bookmarks').set('Cookie', reader);
        expect(after.status).toBe(200);
        expect(after.body).toHaveLength(0);
    });
});
