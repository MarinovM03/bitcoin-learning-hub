import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app, registerAndToken, createArticle, userFixtures } from './helpers.js';
import { resetRssCache } from '../controllers/rssController.js';

const fetchFeed = () => request(app()).get('/rss.xml');

beforeEach(() => {
    resetRssCache();
});

describe('GET /rss.xml', () => {
    it('serves an RSS channel', async () => {
        const res = await fetchFeed();

        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toMatch(/rss\+xml/);
        expect(res.text).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/);
        expect(res.text).toContain('<rss version="2.0"');
        expect(res.text).toContain('<link>http://localhost:5173</link>');
    });

    it('carries published articles and leaves drafts and pending work out', async () => {
        const { token } = await registerAndToken();
        const published = await createArticle(token, { title: 'Readable in a feed', status: 'published' });
        const draft = await createArticle(token, { title: 'Hidden draft piece', status: 'draft' });

        const { token: newcomer } = await registerAndToken(userFixtures.secondary, { trusted: false });
        const pending = await createArticle(newcomer, { title: 'Awaiting review piece' });
        expect(pending.body.status).toBe('pending');

        resetRssCache();
        const res = await fetchFeed();

        expect(res.text).toContain('Readable in a feed');
        expect(res.text).toContain(`/articles/${published.body._id}/details`);
        expect(res.text).not.toContain(String(draft.body._id));
        expect(res.text).not.toContain(String(pending.body._id));
    });

    it('escapes titles that would otherwise break the XML', async () => {
        const { token } = await registerAndToken();
        await createArticle(token, {
            title: 'Bitcoin & "sound money" <explained>',
            status: 'published',
        });

        resetRssCache();
        const res = await fetchFeed();

        expect(res.text).toContain('Bitcoin &amp; &quot;sound money&quot; &lt;explained&gt;');
        const titles = [...res.text.matchAll(/<title>(.*?)<\/title>/g)].map((m) => m[1]);
        for (const title of titles) {
            expect(title).not.toMatch(/[<>"]/);
        }
    });

    it('serves a cached copy until the cache is cleared', async () => {
        const first = await fetchFeed();
        const { token } = await registerAndToken();
        await createArticle(token, { title: 'Published after the cache warmed', status: 'published' });

        const cached = await fetchFeed();
        expect(cached.text).toBe(first.text);

        resetRssCache();
        const fresh = await fetchFeed();
        expect(fresh.text).not.toBe(first.text);
    });
});
