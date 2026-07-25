import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, registerAndToken, userFixtures, glossaryFixture, promoteToAdmin } from './helpers.js';

const createTerm = (token, overrides = {}) =>
    request(app())
        .post('/glossary')
        .set('Cookie', token)
        .send({ ...glossaryFixture, ...overrides });

describe('Glossary', () => {
    it('requires authentication to create a term', async () => {
        const res = await request(app()).post('/glossary').send(glossaryFixture);
        expect(res.status).toBe(401);
    });

    it('holds a submitted term back from the public list until approved', async () => {
        const { token } = await registerAndToken();
        const created = await createTerm(token);
        expect(created.status).toBe(201);
        expect(created.body.status).toBe('pending');

        const list = await request(app()).get('/glossary');
        expect(list.status).toBe(200);
        expect(list.body).toHaveLength(0);
    });

    it('lists a term once an admin approves it', async () => {
        const { token } = await registerAndToken();
        const { body: term } = await createTerm(token);

        const { token: adminToken, user: admin } = await registerAndToken(userFixtures.secondary);
        await promoteToAdmin(admin._id);

        const approved = await request(app())
            .post(`/admin/glossary/${term._id}/approve`)
            .set('Cookie', adminToken);
        expect(approved.status).toBe(200);

        const list = await request(app()).get('/glossary');
        expect(list.body).toHaveLength(1);
        expect(list.body[0].term).toBe(glossaryFixture.term);
    });

    it('publishes an admin-authored term immediately', async () => {
        const { token, user } = await registerAndToken();
        await promoteToAdmin(user._id);

        const created = await createTerm(token);
        expect(created.body.status).toBe('published');
        expect((await request(app()).get('/glossary')).body).toHaveLength(1);
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
            .set('Cookie', token);
        expect(res.status).toBe(200);
    });

    it('forbids deleting someone else\'s term', async () => {
        const { token: ownerToken } = await registerAndToken();
        const { token: otherToken } = await registerAndToken(userFixtures.secondary);
        const { body: term } = await createTerm(ownerToken);
        const res = await request(app())
            .delete(`/glossary/${term._id}`)
            .set('Cookie', otherToken);
        expect(res.status).toBe(403);
    });
});
