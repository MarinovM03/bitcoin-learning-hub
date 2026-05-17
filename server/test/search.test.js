import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, registerAndToken, createArticle } from './helpers.js';

describe('GET /search', () => {
    it('returns empty results for very short queries', async () => {
        const res = await request(app()).get('/search?q=a');
        expect(res.status).toBe(200);
        expect(res.body.articles).toHaveLength(0);
        expect(res.body.glossary).toHaveLength(0);
    });

    it('finds articles by title', async () => {
        const { token } = await registerAndToken();
        await createArticle(token, { title: 'Lightning Network deep dive', content: 'content here' });
        await createArticle(token, { title: 'Mining basics', content: 'content here' });

        const res = await request(app()).get('/search?q=Lightning');
        expect(res.status).toBe(200);
        expect(res.body.articles).toHaveLength(1);
        expect(res.body.articles[0].title).toBe('Lightning Network deep dive');
    });

    it('treats user input as a literal string, not a regex', async () => {
        const { token } = await registerAndToken();
        await createArticle(token, { title: 'Title without special characters' });

        const res = await request(app()).get('/search?q=.*');
        expect(res.status).toBe(200);
        expect(res.body.articles).toHaveLength(0);
    });

    it('filters by category', async () => {
        const { token } = await registerAndToken();
        await createArticle(token, { title: 'Bitcoin economics overview', category: 'Economics' });
        await createArticle(token, { title: 'Bitcoin mining overview', category: 'Mining' });

        const res = await request(app()).get('/search?q=Bitcoin&category=Mining');
        expect(res.body.articles).toHaveLength(1);
        expect(res.body.articles[0].category).toBe('Mining');
    });
});
