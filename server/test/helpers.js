import request from 'supertest';
import User from '../models/User.js';
import { createApp } from '../app.js';

let appInstance;
export const app = () => {
    if (!appInstance) appInstance = createApp({ disableRateLimit: true });
    return appInstance;
};

export const userFixtures = {
    primary: {
        username: 'martin',
        email: 'martin@example.com',
        password: 'supersecret1',
        confirmPassword: 'supersecret1',
    },
    secondary: {
        username: 'olivia',
        email: 'olivia@example.com',
        password: 'anothersecret1',
        confirmPassword: 'anothersecret1',
    },
    tertiary: {
        username: 'noah',
        email: 'noah@example.com',
        password: 'yetanothersecret1',
        confirmPassword: 'yetanothersecret1',
    },
};

export const articleFixture = {
    title: 'Why Bitcoin matters',
    category: 'Basics',
    difficulty: 'Beginner',
    imageUrl: 'https://example.com/cover.jpg',
    summary: 'A short intro to why Bitcoin exists.',
    content: 'Long-form content goes here. Plenty of words to read and learn from.',
    status: 'published',
};

export const glossaryFixture = {
    term: 'UTXO',
    definition: 'An unspent transaction output is a discrete chunk of bitcoin.',
    category: 'Technology',
};

export const register = (overrides = {}) =>
    request(app()).post('/users/register').send({ ...userFixtures.primary, ...overrides });

export const login = (overrides = {}) =>
    request(app()).post('/users/login').send({
        identifier: overrides.identifier ?? userFixtures.primary.email,
        password: overrides.password ?? userFixtures.primary.password,
    });

export const sessionCookie = (res) => {
    const jar = res.headers['set-cookie'] || [];
    const entry = jar.find((cookie) => cookie.startsWith('accessToken='));
    return entry ? entry.split(';')[0] : '';
};

export const registerAndToken = async (overrides = {}, { verified = true, trusted = true } = {}) => {
    const res = await register(overrides);

    const flags = {};
    if (verified) flags.emailVerified = true;
    if (trusted) flags.isTrusted = true;
    if (Object.keys(flags).length) {
        await User.updateOne({ _id: res.body._id }, flags);
    }
    res.body.emailVerified = verified;

    return { user: res.body, token: sessionCookie(res) };
};

export const createArticle = (token, overrides = {}) =>
    request(app())
        .post('/articles')
        .set('Cookie', token)
        .send({ ...articleFixture, ...overrides });

export const promoteToAdmin = (userId) =>
    User.updateOne({ _id: userId }, { role: 'admin' });
