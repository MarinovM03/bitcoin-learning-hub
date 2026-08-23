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
import { trustThreshold } from '../utils/trust.js';

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
    it(`promotes an author after ${trustThreshold()} approvals and not before`, async () => {
        const adminToken = await adminSession();
        const { token, user } = await newAuthor();

        for (let i = 1; i <= trustThreshold(); i++) {
            const { body: article } = await createArticle(token, { title: `Submission number ${i}` });
            expect(article.status).toBe('pending');

            await approve(adminToken, article._id);

            const stored = await User.findById(user._id).select('+isTrusted +approvedArticles');
            expect(stored.approvedArticles).toBe(i);
            expect(stored.isTrusted).toBe(i >= trustThreshold());
        }

        const afterTrust = await createArticle(token, { title: 'First unreviewed submission' });
        expect(afterTrust.body.status).toBe('published');
    });

    it('does not credit the same article twice when it is edited and re-approved', async () => {
        const adminToken = await adminSession();
        const { token, user } = await newAuthor();
        const { body: article } = await createArticle(token);

        for (let round = 0; round < trustThreshold() + 2; round++) {
            await approve(adminToken, article._id);

            const stored = await User.findById(user._id).select('+isTrusted +approvedArticles');
            expect(stored.approvedArticles).toBe(1);
            expect(stored.isTrusted).toBe(false);

            const edited = await request(app())
                .put(`/articles/${article._id}`)
                .set('Cookie', token)
                .send({ content: `Revision number ${round} of the same article.` });
            expect(edited.body.status).toBe('pending');
        }

        const stillReviewed = await createArticle(token, { title: 'Another submission entirely' });
        expect(stillReviewed.body.status).toBe('pending');
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

    it('reaches pending glossary terms beyond the first page', async () => {
        const adminToken = await adminSession();
        const { token } = await registerAndToken();

        for (const term of ['Alpha', 'Bravo', 'Charlie']) {
            const res = await request(app())
                .post('/glossary')
                .set('Cookie', token)
                .send({
                    term,
                    definition: `A placeholder definition written for ${term}.`,
                    category: 'Technology',
                });
            expect(res.status).toBe(201);
            expect(res.body.status).toBe('pending');
        }

        const first = await request(app())
            .get('/admin/moderation/queue?page=1&limit=2')
            .set('Cookie', adminToken);
        expect(first.status).toBe(200);
        expect(first.body.termTotal).toBe(3);
        expect(first.body.totalPages).toBe(2);

        const second = await request(app())
            .get('/admin/moderation/queue?page=2&limit=2')
            .set('Cookie', adminToken);
        expect(second.status).toBe(200);

        const pageOne = first.body.terms.map((t) => t.term);
        const pageTwo = second.body.terms.map((t) => t.term);
        expect(pageOne).toHaveLength(2);
        expect(pageTwo).toHaveLength(1);
        expect([...pageOne, ...pageTwo].sort()).toEqual(['Alpha', 'Bravo', 'Charlie']);
    });

    it('serves the full body of a pending article to a reviewer', async () => {
        const adminToken = await adminSession();
        const { token } = await newAuthor();
        const { body: article } = await createArticle(token, { content: 'The body a reviewer must be able to read.' });

        const anonymous = await request(app()).get(`/articles/${article._id}`);
        expect(anonymous.status).toBe(404);

        const preview = await request(app())
            .get(`/admin/articles/${article._id}/preview`)
            .set('Cookie', adminToken);
        expect(preview.status).toBe(200);
        expect(preview.body.content).toBe('The body a reviewer must be able to read.');
        expect(preview.body.status).toBe('pending');
    });

    it('keeps the preview endpoint closed to non-admins', async () => {
        const { token } = await newAuthor();
        const { body: article } = await createArticle(token);

        const res = await request(app())
            .get(`/admin/articles/${article._id}/preview`)
            .set('Cookie', token);
        expect(res.status).toBe(403);
    });

    it('refuses to approve an article that is not pending', async () => {
        const adminToken = await adminSession();
        const { token } = await registerAndToken();
        const { body: article } = await createArticle(token, { status: 'published' });

        const res = await approve(adminToken, article._id);
        expect(res.status).toBe(404);
    });
});

describe('the write surface of a pending article', () => {
    const pendingArticle = async () => {
        const { token } = await newAuthor();
        const { body: article } = await createArticle(token);
        expect(article.status).toBe('pending');
        return article;
    };

    it('refuses comments from a reader who is not the author', async () => {
        const article = await pendingArticle();
        const { token: outsider } = await registerAndToken(userFixtures.secondary);

        const res = await request(app())
            .post('/comments')
            .set('Cookie', outsider)
            .send({ articleId: article._id, text: 'Seeding social proof early.' });
        expect(res.status).toBe(404);
    });

    it('refuses likes from a reader who is not the author', async () => {
        const article = await pendingArticle();
        const { token: outsider } = await registerAndToken(userFixtures.secondary);

        const res = await request(app())
            .post('/likes')
            .set('Cookie', outsider)
            .send({ articleId: article._id });
        expect(res.status).toBe(404);
    });

    it('refuses bookmarks from a reader who is not the author', async () => {
        const article = await pendingArticle();
        const { token: outsider } = await registerAndToken(userFixtures.secondary);

        const res = await request(app())
            .post('/bookmarks')
            .set('Cookie', outsider)
            .send({ articleId: article._id });
        expect(res.status).toBe(404);
    });

    it('still lets the author bookmark their own submission', async () => {
        const { token } = await newAuthor();
        const { body: article } = await createArticle(token);

        const res = await request(app())
            .post('/bookmarks')
            .set('Cookie', token)
            .send({ articleId: article._id });
        expect(res.status).toBe(201);
    });
});

describe('unpublished articles as an existence oracle', () => {
    it('gives nothing away through the related and series endpoints', async () => {
        const { token } = await newAuthor();
        const { body: article } = await createArticle(token, { seriesName: 'Deep dives', seriesPart: 1 });

        const related = await request(app()).get(`/articles/${article._id}/related`);
        expect(related.status).toBe(404);

        const series = await request(app()).get(`/articles/${article._id}/series`);
        expect(series.status).toBe(404);
    });

    it('still serves both endpoints to the author', async () => {
        const { token } = await newAuthor();
        const { body: article } = await createArticle(token, { seriesName: 'Deep dives', seriesPart: 1 });

        const related = await request(app())
            .get(`/articles/${article._id}/related`)
            .set('Cookie', token);
        expect(related.status).toBe(200);

        const series = await request(app())
            .get(`/articles/${article._id}/series`)
            .set('Cookie', token);
        expect(series.status).toBe(200);
    });
});

describe('the approval threshold', () => {
    it('honours an override and falls back when it is unusable', async () => {
        const original = process.env.TRUST_THRESHOLD;
        try {
            process.env.TRUST_THRESHOLD = '2';
            expect(trustThreshold()).toBe(2);

            const adminToken = await adminSession();
            const { token, user } = await newAuthor();

            for (let i = 1; i <= 2; i++) {
                const { body } = await createArticle(token, { title: `Submission number ${i}` });
                await approve(adminToken, body._id);
            }

            const stored = await User.findById(user._id).select('+isTrusted +approvedArticles');
            expect(stored.approvedArticles).toBe(2);
            expect(stored.isTrusted).toBe(true);

            for (const bad of ['0', '-3', 'many', '']) {
                process.env.TRUST_THRESHOLD = bad;
                expect(trustThreshold()).toBe(5);
            }
        } finally {
            if (original === undefined) delete process.env.TRUST_THRESHOLD;
            else process.env.TRUST_THRESHOLD = original;
        }
    });
});
