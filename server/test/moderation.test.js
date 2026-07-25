import { describe, it, expect } from 'vitest';
import request from 'supertest';
import {
    app,
    registerAndToken,
    createArticle,
    promoteToAdmin,
    userFixtures,
} from './helpers.js';
import Article from '../models/Article.js';
import User from '../models/User.js';
import { TRUST_THRESHOLD } from '../utils/trust.js';

const adminSession = async (fixture = userFixtures.tertiary) => {
    const { token, user } = await registerAndToken(fixture);
    await promoteToAdmin(user._id);
    return token;
};

const approve = (adminToken, articleId) =>
    request(app()).post(`/admin/articles/${articleId}/approve`).set('Cookie', adminToken);

const newAuthor = () => registerAndToken({}, { trusted: false });

describe('submissions from untrusted authors', () => {
    it('routes a publish attempt into the review queue', async () => {
        const { token } = await newAuthor();

        const res = await createArticle(token, { status: 'published' });
        expect(res.status).toBe(201);
        expect(res.body.status).toBe('pending');
    });

    it('keeps a pending article out of every public surface', async () => {
        const { token } = await newAuthor();
        const { body: article } = await createArticle(token, { title: 'Pending piece' });

        const list = await request(app()).get('/articles');
        expect(list.body.articles).toHaveLength(0);

        const search = await request(app()).get('/search?q=Pending');
        expect(search.body.articles).toHaveLength(0);

        const details = await request(app()).get(`/articles/${article._id}`);
        expect(details.status).toBe(404);
    });

    it('still lets the author see their own pending article', async () => {
        const { token } = await newAuthor();
        const { body: article } = await createArticle(token);

        const details = await request(app()).get(`/articles/${article._id}`).set('Cookie', token);
        expect(details.status).toBe(200);

        const mine = await request(app()).get('/articles/my').set('Cookie', token);
        expect(mine.body).toHaveLength(1);
        expect(mine.body[0].status).toBe('pending');
    });

    it('leaves an explicit draft as a draft', async () => {
        const { token } = await newAuthor();
        const res = await createArticle(token, { status: 'draft' });
        expect(res.body.status).toBe('draft');
    });

    it('sends an approved article back for re-review when the author edits it', async () => {
        const adminToken = await adminSession();
        const { token } = await newAuthor();
        const { body: article } = await createArticle(token);

        await approve(adminToken, article._id);
        expect((await Article.findById(article._id)).status).toBe('published');

        const edited = await request(app())
            .put(`/articles/${article._id}`)
            .set('Cookie', token)
            .send({ content: 'Completely different content pointing somewhere else.' });
        expect(edited.status).toBe(200);
        expect(edited.body.status).toBe('pending');

        const details = await request(app()).get(`/articles/${article._id}`);
        expect(details.status).toBe(404);
    });
});

describe('trusted authors', () => {
    it('publishes immediately', async () => {
        const { token } = await registerAndToken();
        const res = await createArticle(token, { status: 'published' });
        expect(res.body.status).toBe('published');
    });

    it('edits without returning to the queue', async () => {
        const { token } = await registerAndToken();
        const { body: article } = await createArticle(token, { status: 'published' });

        const edited = await request(app())
            .put(`/articles/${article._id}`)
            .set('Cookie', token)
            .send({ summary: 'A revised summary.' });
        expect(edited.body.status).toBe('published');
    });
});

describe('earning publishing rights', () => {
    it(`promotes an author after ${TRUST_THRESHOLD} approvals and not before`, async () => {
        const adminToken = await adminSession();
        const { token, user } = await newAuthor();

        for (let i = 1; i <= TRUST_THRESHOLD; i++) {
            const { body: article } = await createArticle(token, { title: `Submission number ${i}` });
            expect(article.status).toBe('pending');

            await approve(adminToken, article._id);

            const stored = await User.findById(user._id).select('+isTrusted +approvedArticles');
            expect(stored.approvedArticles).toBe(i);
            expect(stored.isTrusted).toBe(i >= TRUST_THRESHOLD);
        }

        const afterTrust = await createArticle(token, { title: 'First unreviewed submission' });
        expect(afterTrust.body.status).toBe('published');
    });

    it('does not advance the counter when a submission is rejected', async () => {
        const adminToken = await adminSession();
        const { token, user } = await newAuthor();
        const { body: article } = await createArticle(token);

        const rejected = await request(app())
            .post(`/admin/articles/${article._id}/reject`)
            .set('Cookie', adminToken)
            .send({ note: 'Needs sources.' });
        expect(rejected.status).toBe(200);
        expect(rejected.body.status).toBe('draft');
        expect(rejected.body.moderationNote).toBe('Needs sources.');

        const stored = await User.findById(user._id).select('+isTrusted +approvedArticles');
        expect(stored.approvedArticles ?? 0).toBe(0);
        expect(stored.isTrusted).toBe(false);
    });

    it('lets an admin grant and revoke trust directly', async () => {
        const adminToken = await adminSession();
        const { token, user } = await newAuthor();

        const granted = await request(app())
            .patch(`/admin/users/${user._id}/trust`)
            .set('Cookie', adminToken)
            .send({ isTrusted: true });
        expect(granted.status).toBe(200);
        expect(granted.body.isTrusted).toBe(true);
        expect((await createArticle(token, { title: 'Now trusted here' })).body.status).toBe('published');

        await request(app())
            .patch(`/admin/users/${user._id}/trust`)
            .set('Cookie', adminToken)
            .send({ isTrusted: false });
        expect((await createArticle(token, { title: 'Revoked again here' })).body.status).toBe('pending');
    });

    it('never reveals the threshold or trust state to the account itself', async () => {
        const { token } = await newAuthor();

        const profile = await request(app()).get('/users/profile').set('Cookie', token);
        expect(profile.status).toBe(200);
        expect(profile.body).not.toHaveProperty('isTrusted');
        expect(profile.body).not.toHaveProperty('approvedArticles');

        const article = await createArticle(token);
        const trustHints = Object.keys(article.body)
            .concat(Object.keys(profile.body))
            .filter((key) => /trust|approvedArticles|threshold|remaining/i.test(key));
        expect(trustHints).toEqual([]);
    });
});

describe('the moderation queue', () => {
    it('lists pending articles and terms for an admin only', async () => {
        const adminToken = await adminSession();
        const { token } = await newAuthor();
        await createArticle(token);

        const forbidden = await request(app()).get('/admin/moderation/queue').set('Cookie', token);
        expect(forbidden.status).toBe(403);

        const queue = await request(app()).get('/admin/moderation/queue').set('Cookie', adminToken);
        expect(queue.status).toBe(200);
        expect(queue.body.articles).toHaveLength(1);
        expect(queue.body.articleTotal).toBe(1);
        expect(queue.body.articles[0]._ownerId.username).toBe(userFixtures.primary.username);
    });

    it('refuses to approve an article that is not pending', async () => {
        const adminToken = await adminSession();
        const { token } = await registerAndToken();
        const { body: article } = await createArticle(token, { status: 'published' });

        const res = await approve(adminToken, article._id);
        expect(res.status).toBe(404);
    });
});
