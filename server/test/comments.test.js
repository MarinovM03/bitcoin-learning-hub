import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, registerAndToken, createArticle, userFixtures } from './helpers.js';

const postComment = (token, articleId, text = 'Great post!') =>
    request(app())
        .post('/comments')
        .set('x-authorization', token)
        .send({ articleId, text });

describe('Comments', () => {
    it('rejects unauthenticated comment creation', async () => {
        const { token } = await registerAndToken();
        const { body: article } = await createArticle(token);
        const res = await request(app())
            .post('/comments')
            .send({ articleId: article._id, text: 'hey' });
        expect(res.status).toBe(401);
    });

    it('creates a comment and lists it for the article', async () => {
        const { token } = await registerAndToken();
        const { body: article } = await createArticle(token);

        const create = await postComment(token, article._id, 'First comment here');
        expect(create.status).toBe(201);
        expect(create.body.text).toBe('First comment here');

        const list = await request(app()).get(`/comments/${article._id}`);
        expect(list.status).toBe(200);
        expect(list.body).toHaveLength(1);
    });

    it('allows the comment owner to delete their comment', async () => {
        const { token } = await registerAndToken();
        const { body: article } = await createArticle(token);
        const { body: comment } = await postComment(token, article._id);

        const del = await request(app())
            .delete(`/comments/${comment._id}`)
            .set('x-authorization', token);
        expect(del.status).toBe(200);

        const list = await request(app()).get(`/comments/${article._id}`);
        expect(list.body).toHaveLength(0);
    });

    it('forbids deleting another user\'s comment', async () => {
        const { token: ownerToken } = await registerAndToken();
        const { token: otherToken } = await registerAndToken(userFixtures.secondary);
        const { body: article } = await createArticle(ownerToken);
        const { body: comment } = await postComment(ownerToken, article._id);

        const res = await request(app())
            .delete(`/comments/${comment._id}`)
            .set('x-authorization', otherToken);
        expect(res.status).toBe(403);
    });

    it('rejects comments shorter than the minimum length', async () => {
        const { token } = await registerAndToken();
        const { body: article } = await createArticle(token);
        const res = await postComment(token, article._id, 'a');
        expect(res.status).toBe(400);
    });
});
