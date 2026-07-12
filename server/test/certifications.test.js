import { describe, it, expect } from 'vitest';
import request from 'supertest';
import {
    app, registerAndToken, userFixtures, createArticle, promoteToAdmin,
} from './helpers.js';
import ReadArticle from '../models/ReadArticle.js';
import PathCertification from '../models/PathCertification.js';
import User from '../models/User.js';

const quizA = [
    { question: 'Q1?', options: ['a', 'b', 'c', 'd'], correctIndex: 0 },
    { question: 'Q2?', options: ['a', 'b', 'c', 'd'], correctIndex: 1 },
];
const quizB = [
    { question: 'Q3?', options: ['a', 'b', 'c', 'd'], correctIndex: 2 },
    { question: 'Q4?', options: ['a', 'b', 'c', 'd'], correctIndex: 3 },
];
const correctAnswers = [0, 1, 2, 3];

const buildPathWithExam = async () => {
    const { token: authorToken } = await registerAndToken(userFixtures.tertiary);
    const { body: articleA } = await createArticle(authorToken, { title: 'Exam article one', quiz: quizA });
    const { body: articleB } = await createArticle(authorToken, {
        title: 'Exam article two',
        quiz: quizB,
        seriesName: '',
    });
    const pathRes = await request(app()).post('/paths').set('x-authorization', authorToken).send({
        title: 'Certified Bitcoin Path',
        description: 'A path with a final exam for testing.',
        difficulty: 'Intermediate',
        articles: [articleA._id, articleB._id],
    });
    expect(pathRes.status).toBe(201);
    return { authorToken, path: pathRes.body, articleIds: [articleA._id, articleB._id] };
};

const readAll = async (token, articleIds) => {
    for (const id of articleIds) {
        const res = await request(app()).post(`/articles/${id}/read`).set('x-authorization', token);
        expect(res.status).toBe(200);
    }
};

describe('Path certification exam', () => {
    it('requires reading every article before the exam', async () => {
        const { path } = await buildPathWithExam();
        const { token: readerToken } = await registerAndToken();

        const res = await request(app())
            .get(`/paths/${path._id}/quiz`)
            .set('x-authorization', readerToken);
        expect(res.status).toBe(403);
    });

    it('serves exam questions without grading data', async () => {
        const { path, articleIds } = await buildPathWithExam();
        const { token: readerToken } = await registerAndToken();
        await readAll(readerToken, articleIds);

        const res = await request(app())
            .get(`/paths/${path._id}/quiz`)
            .set('x-authorization', readerToken);
        expect(res.status).toBe(200);
        expect(res.body.totalQuestions).toBe(4);
        for (const q of res.body.questions) {
            expect(q).not.toHaveProperty('correctIndex');
        }
    });

    it('issues a certification with a path snapshot on passing', async () => {
        const { authorToken, path, articleIds } = await buildPathWithExam();
        const { token: readerToken } = await registerAndToken();
        await readAll(readerToken, articleIds);

        const submit = await request(app())
            .post(`/paths/${path._id}/quiz`)
            .set('x-authorization', readerToken)
            .send({ answers: correctAnswers });
        expect(submit.status).toBe(200);
        expect(submit.body.passed).toBe(true);
        expect(submit.body.score).toBe(100);
        expect(submit.body.certification).toBeTruthy();

        const del = await request(app())
            .delete(`/paths/${path._id}`)
            .set('x-authorization', authorToken);
        expect(del.status).toBe(200);

        const certs = await request(app())
            .get('/users/me/certifications')
            .set('x-authorization', readerToken);
        expect(certs.status).toBe(200);
        expect(certs.body).toHaveLength(1);
        expect(certs.body[0].pathId).toBeNull();
        expect(certs.body[0].pathTitle).toBe('Certified Bitcoin Path');
        expect(certs.body[0].pathDifficulty).toBe('Intermediate');
    });

    it('does not issue a certification below the pass threshold', async () => {
        const { path, articleIds } = await buildPathWithExam();
        const { token: readerToken } = await registerAndToken();
        await readAll(readerToken, articleIds);

        const submit = await request(app())
            .post(`/paths/${path._id}/quiz`)
            .set('x-authorization', readerToken)
            .send({ answers: [0, 0, 0, 0] });
        expect(submit.status).toBe(200);
        expect(submit.body.passed).toBe(false);
        expect(submit.body.certification).toBeNull();
    });
});

describe('Admin user deletion cascade', () => {
    it('removes read history and certifications with the user', async () => {
        const { path, articleIds } = await buildPathWithExam();
        const { user: reader, token: readerToken } = await registerAndToken();
        await readAll(readerToken, articleIds);
        await request(app())
            .post(`/paths/${path._id}/quiz`)
            .set('x-authorization', readerToken)
            .send({ answers: correctAnswers });

        const { user: adminUser, token: adminToken } = await registerAndToken(userFixtures.secondary);
        await promoteToAdmin(adminUser._id);

        const del = await request(app())
            .delete(`/admin/users/${reader._id}`)
            .set('x-authorization', adminToken);
        expect(del.status).toBe(200);

        expect(await User.findById(reader._id)).toBeNull();
        expect(await ReadArticle.countDocuments({ _ownerId: reader._id })).toBe(0);
        expect(await PathCertification.countDocuments({ _ownerId: reader._id })).toBe(0);
    });
});
