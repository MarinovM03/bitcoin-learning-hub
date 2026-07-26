import { describe, it, expect } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { app, registerAndToken, createArticle, userFixtures, promoteToAdmin } from './helpers.js';
import Comment from '../models/Comment.js';
import { COMMENT_LIMIT_PER_WINDOW } from '../controllers/commentController.js';

const postComment = (token, articleId, text = 'Great post!') =>
    request(app())
        .post('/comments')
        .set('Cookie', token)
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
            .set('Cookie', token);
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
            .set('Cookie', otherToken);
        expect(res.status).toBe(403);
    });

    it('rejects comments shorter than the minimum length', async () => {
        const { token } = await registerAndToken();
        const { body: article } = await createArticle(token);
        const res = await postComment(token, article._id, 'a');
        expect(res.status).toBe(400);
    });

    it('lets the owner edit a fresh comment', async () => {
        const { token } = await registerAndToken();
        const { body: article } = await createArticle(token);
        const { body: comment } = await postComment(token, article._id, 'Original text here');

        const res = await request(app())
            .put(`/comments/${comment._id}`)
            .set('Cookie', token)
            .send({ text: 'Edited text here' });
        expect(res.status).toBe(200);
        expect(res.body.text).toBe('Edited text here');
        expect(res.body._ownerId.username).toBeTypeOf('string');
    });

    it('forbids editing another user\'s comment', async () => {
        const { token: ownerToken } = await registerAndToken();
        const { token: otherToken } = await registerAndToken(userFixtures.secondary);
        const { body: article } = await createArticle(ownerToken);
        const { body: comment } = await postComment(ownerToken, article._id);

        const res = await request(app())
            .put(`/comments/${comment._id}`)
            .set('Cookie', otherToken)
            .send({ text: 'Hijacked edit attempt' });
        expect(res.status).toBe(403);
    });

    it('rejects edits after the five-minute window', async () => {
        const { token } = await registerAndToken();
        const { body: article } = await createArticle(token);
        const { body: comment } = await postComment(token, article._id);

        await Comment.collection.updateOne(
            { _id: new mongoose.Types.ObjectId(comment._id) },
            { $set: { createdAt: new Date(Date.now() - 6 * 60 * 1000) } },
        );

        const res = await request(app())
            .put(`/comments/${comment._id}`)
            .set('Cookie', token)
            .send({ text: 'Too late to edit this' });
        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/within 5 minutes/i);
    });
});

describe('comment flood protection', () => {
    it('stops a single account posting past the hourly cap', async () => {
        const { token: authorToken } = await registerAndToken();
        const article = await createArticle(authorToken, { status: 'published' });
        const { token } = await registerAndToken(userFixtures.secondary);

        for (let i = 0; i < COMMENT_LIMIT_PER_WINDOW; i++) {
            const res = await postComment(token, article.body._id, `Comment number ${i} in the burst.`);
            expect(res.status).toBe(201);
        }

        const blocked = await postComment(token, article.body._id, 'One comment too many for this window.');
        expect(blocked.status).toBe(429);
        expect(blocked.body.message).toMatch(/short time/i);
    });

    it('does not hold admins to the cap', async () => {
        const { token: authorToken } = await registerAndToken();
        const article = await createArticle(authorToken, { status: 'published' });
        const { token, user } = await registerAndToken(userFixtures.secondary);
        await promoteToAdmin(user._id);

        for (let i = 0; i <= COMMENT_LIMIT_PER_WINDOW; i++) {
            const res = await postComment(token, article.body._id, `Moderator note number ${i} here.`);
            expect(res.status).toBe(201);
        }
    });
});
