import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app, registerAndToken, createArticle, promoteToAdmin, userFixtures, glossaryFixture } from './helpers.js';
import { resetSitemapCache } from '../controllers/sitemapController.js';

const fetchSitemap = () => request(app()).get('/sitemap.xml');

beforeEach(() => {
    resetSitemapCache();
});

describe('GET /sitemap.xml', () => {
    it('serves XML with the static routes', async () => {
        const res = await fetchSitemap();

        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toMatch(/xml/);
        expect(res.text).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/);
        expect(res.text).toContain('<loc>http://localhost:5173</loc>');
        expect(res.text).toContain('<loc>http://localhost:5173/articles</loc>');
        expect(res.text).toContain('<loc>http://localhost:5173/glossary</loc>');
    });

    it('lists published articles and leaves drafts and pending work out', async () => {
        const { token } = await registerAndToken();
        const published = await createArticle(token, { title: 'Indexable published piece', status: 'published' });
        const draft = await createArticle(token, { title: 'Hidden draft piece', status: 'draft' });

        const { token: newcomer } = await registerAndToken(userFixtures.secondary, { trusted: false });
        const pending = await createArticle(newcomer, { title: 'Awaiting review piece' });
        expect(pending.body.status).toBe('pending');

        const res = await fetchSitemap();
        expect(res.text).toContain(`/articles/${published.body._id}/details`);
        expect(res.text).not.toContain(String(draft.body._id));
        expect(res.text).not.toContain(String(pending.body._id));
    });

    it('lists approved glossary terms only', async () => {
        const { token, user } = await registerAndToken();
        await promoteToAdmin(user._id);
        const approved = await request(app()).post('/glossary').set('Cookie', token).send(glossaryFixture);
        expect(approved.body.status).toBe('published');

        const { token: newcomer } = await registerAndToken(userFixtures.secondary);
        const awaiting = await request(app()).post('/glossary').set('Cookie', newcomer)
            .send({ ...glossaryFixture, term: 'Awaiting Approval' });
        expect(awaiting.body.status).toBe('pending');

        const res = await fetchSitemap();
        expect(res.text).toContain(`/glossary/${approved.body._id}`);
        expect(res.text).not.toContain(String(awaiting.body._id));
    });

    it('emits no raw XML metacharacters inside a loc', async () => {
        const res = await fetchSitemap();
        const locs = [...res.text.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);

        expect(locs.length).toBeGreaterThan(0);
        for (const loc of locs) {
            expect(loc).not.toMatch(/[<>"']/);
        }
    });

    it('serves a cached copy until the cache is cleared', async () => {
        const first = await fetchSitemap();
        const { token } = await registerAndToken();
        await createArticle(token, { title: 'Published after the cache warmed', status: 'published' });

        const cached = await fetchSitemap();
        expect(cached.text).toBe(first.text);

        resetSitemapCache();
        const fresh = await fetchSitemap();
        expect(fresh.text).not.toBe(first.text);
    });
});
