import { describe, it, expect } from 'vitest';
import request from 'supertest';
import {
    app,
    registerAndToken,
    createArticle,
    promoteToAdmin,
    userFixtures,
    glossaryFixture,
} from './helpers.js';
import Report from '../models/Report.js';

const adminSession = async () => {
    const { token, user } = await registerAndToken(userFixtures.tertiary);
    await promoteToAdmin(user._id);
    return token;
};

const report = (token, body) =>
    request(app()).post('/reports').set('Cookie', token).send(body);

const setup = async () => {
    const { token: authorToken } = await registerAndToken();
    const article = await createArticle(authorToken, { status: 'published' });
    const { token: readerToken } = await registerAndToken(userFixtures.secondary);
    return { authorToken, readerToken, articleId: article.body._id };
};

describe('POST /reports', () => {
    it('requires authentication', async () => {
        const res = await request(app()).post('/reports').send({
            targetType: 'article', targetId: '507f1f77bcf86cd799439011', reason: 'spam',
        });
        expect(res.status).toBe(401);
    });

    it('records a report against an article', async () => {
        const { readerToken, articleId } = await setup();

        const res = await report(readerToken, { targetType: 'article', targetId: articleId, reason: 'scam', note: 'Asks for BTC upfront.' });
        expect(res.status).toBe(201);

        const stored = await Report.findOne({ targetId: articleId });
        expect(stored.reason).toBe('scam');
        expect(stored.note).toBe('Asks for BTC upfront.');
        expect(stored.status).toBe('open');
    });

    it('refuses an unknown reason or target type', async () => {
        const { readerToken, articleId } = await setup();

        expect((await report(readerToken, { targetType: 'article', targetId: articleId, reason: 'because' })).status).toBe(400);
        expect((await report(readerToken, { targetType: 'planet', targetId: articleId, reason: 'spam' })).status).toBe(400);
    });

    it('refuses to report content that does not exist', async () => {
        const { readerToken } = await setup();
        const res = await report(readerToken, {
            targetType: 'article', targetId: '507f1f77bcf86cd799439011', reason: 'spam',
        });
        expect(res.status).toBe(404);
    });

    it('stops an author reporting their own work', async () => {
        const { authorToken, articleId } = await setup();
        const res = await report(authorToken, { targetType: 'article', targetId: articleId, reason: 'spam' });
        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/your own content/i);
    });

    it('counts a repeat report from the same person only once', async () => {
        const { readerToken, articleId } = await setup();

        expect((await report(readerToken, { targetType: 'article', targetId: articleId, reason: 'spam' })).status).toBe(201);
        expect((await report(readerToken, { targetType: 'article', targetId: articleId, reason: 'abuse' })).status).toBe(200);

        expect(await Report.countDocuments({ targetId: articleId })).toBe(1);
    });

    it('lets different people report the same item', async () => {
        const { readerToken, articleId } = await setup();
        const { token: thirdToken } = await registerAndToken(userFixtures.tertiary);

        await report(readerToken, { targetType: 'article', targetId: articleId, reason: 'spam' });
        await report(thirdToken, { targetType: 'article', targetId: articleId, reason: 'scam' });

        expect(await Report.countDocuments({ targetId: articleId })).toBe(2);
    });
});

describe('GET /admin/reports', () => {
    it('is closed to non-admins', async () => {
        const { readerToken } = await setup();
        const res = await request(app()).get('/admin/reports').set('Cookie', readerToken);
        expect(res.status).toBe(403);
    });

    it('lists open reports with a snapshot of what was flagged', async () => {
        const { readerToken, articleId } = await setup();
        await report(readerToken, { targetType: 'article', targetId: articleId, reason: 'scam', note: 'Phishing link.' });
        const adminToken = await adminSession();

        const res = await request(app()).get('/admin/reports').set('Cookie', adminToken);
        expect(res.status).toBe(200);
        expect(res.body.reports).toHaveLength(1);
        expect(res.body.openTotal).toBe(1);

        const row = res.body.reports[0];
        expect(row.reason).toBe('scam');
        expect(row.note).toBe('Phishing link.');
        expect(row._reporterId.username).toBe(userFixtures.secondary.username);
        expect(row.target.label).toBe('Why Bitcoin matters');
    });

    it('reports a missing target as null rather than failing', async () => {
        const { readerToken, articleId } = await setup();
        await report(readerToken, { targetType: 'article', targetId: articleId, reason: 'spam' });

        await Report.updateOne({ targetId: articleId }, { targetId: '507f1f77bcf86cd799439011' });

        const adminToken = await adminSession();
        const res = await request(app()).get('/admin/reports').set('Cookie', adminToken);
        expect(res.status).toBe(200);
        expect(res.body.reports[0].target).toBeNull();
    });

    it('marks a report resolved or dismissed', async () => {
        const { readerToken, articleId } = await setup();
        await report(readerToken, { targetType: 'article', targetId: articleId, reason: 'spam' });
        const adminToken = await adminSession();
        const { _id } = await Report.findOne({ targetId: articleId });

        const res = await request(app())
            .patch(`/admin/reports/${_id}`)
            .set('Cookie', adminToken)
            .send({ status: 'dismissed' });
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('dismissed');

        const open = await request(app()).get('/admin/reports').set('Cookie', adminToken);
        expect(open.body.reports).toHaveLength(0);
        expect(open.body.openTotal).toBe(0);
    });

    it('rejects a status outside the allowed set', async () => {
        const { readerToken, articleId } = await setup();
        await report(readerToken, { targetType: 'article', targetId: articleId, reason: 'spam' });
        const adminToken = await adminSession();
        const { _id } = await Report.findOne({ targetId: articleId });

        const res = await request(app())
            .patch(`/admin/reports/${_id}`)
            .set('Cookie', adminToken)
            .send({ status: 'ignored' });
        expect(res.status).toBe(400);
    });
});

describe('reports do not outlive their target', () => {
    it('clears reports when the reported article is deleted', async () => {
        const { readerToken, articleId } = await setup();
        await report(readerToken, { targetType: 'article', targetId: articleId, reason: 'spam' });
        const adminToken = await adminSession();

        await request(app()).delete(`/admin/articles/${articleId}`).set('Cookie', adminToken).expect(200);

        expect(await Report.countDocuments({ targetId: articleId })).toBe(0);
    });

    it('clears reports when the reported comment is deleted', async () => {
        const { readerToken, articleId } = await setup();

        const comment = await request(app())
            .post('/comments')
            .set('Cookie', readerToken)
            .send({ articleId, text: 'A comment that will be reported.' });
        expect(comment.status).toBe(201);

        const { token: thirdToken } = await registerAndToken(userFixtures.tertiary);
        await report(thirdToken, { targetType: 'comment', targetId: comment.body._id, reason: 'abuse' });
        expect(await Report.countDocuments({ targetType: 'comment' })).toBe(1);

        await request(app())
            .delete(`/comments/${comment.body._id}`)
            .set('Cookie', readerToken)
            .expect(200);

        expect(await Report.countDocuments({ targetType: 'comment' })).toBe(0);
    });

    it('clears reports when a reported glossary term is deleted', async () => {
        const { token: ownerToken, user: owner } = await registerAndToken();
        await promoteToAdmin(owner._id);
        const term = await request(app()).post('/glossary').set('Cookie', ownerToken).send(glossaryFixture);
        expect(term.status).toBe(201);

        const { token: readerToken } = await registerAndToken(userFixtures.secondary);
        await report(readerToken, { targetType: 'glossary', targetId: term.body._id, reason: 'misinformation' });
        expect(await Report.countDocuments({ targetType: 'glossary' })).toBe(1);

        await request(app())
            .delete(`/glossary/${term.body._id}`)
            .set('Cookie', ownerToken)
            .expect(200);

        expect(await Report.countDocuments({ targetType: 'glossary' })).toBe(0);
    });
});
