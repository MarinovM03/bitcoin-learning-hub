import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, registerAndToken, userFixtures, glossaryFixture } from './helpers.js';

const createTerm = (token, overrides = {}) =>
    request(app())
        .post('/glossary')
        .set('x-authorization', token)
        .send({ ...glossaryFixture, ...overrides });

describe('Glossary', () => {
    it('requires authentication to create a term', async () => {
        const res = await request(app()).post('/glossary').send(glossaryFixture);
        expect(res.status).toBe(401);
    });

    it('creates a term and lists it', async () => {
        const { token } = await registerAndToken();
        const created = await createTerm(token);
        expect(created.status).toBe(201);

        const list = await request(app()).get('/glossary');
        expect(list.status).toBe(200);
        expect(list.body).toHaveLength(1);
    });

    it('rejects a duplicate term (case-insensitive)', async () => {
        const { token } = await registerAndToken();
        await createTerm(token);
        const dup = await createTerm(token, { term: 'utxo' });
        expect(dup.status).toBe(400);
    });

    it('rejects too short a definition', async () => {
        const { token } = await registerAndToken();
        const res = await createTerm(token, { definition: 'short' });
        expect(res.status).toBe(400);
    });

    it('allows the owner to delete their term', async () => {
        const { token } = await registerAndToken();
        const { body: term } = await createTerm(token);
        const res = await request(app())
            .delete(`/glossary/${term._id}`)
            .set('x-authorization', token);
        expect(res.status).toBe(200);
    });

    it('forbids deleting someone else\'s term', async () => {
        const { token: ownerToken } = await registerAndToken();
        const { token: otherToken } = await registerAndToken(userFixtures.secondary);
        const { body: term } = await createTerm(ownerToken);
        const res = await request(app())
            .delete(`/glossary/${term._id}`)
            .set('x-authorization', otherToken);
        expect(res.status).toBe(403);
    });
});
