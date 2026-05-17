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

export const registerAndToken = async (overrides = {}) => {
    const res = await register(overrides);
    return { user: res.body, token: res.body.accessToken };
};

export const createArticle = (token, overrides = {}) =>
    request(app())
        .post('/articles')
        .set('x-authorization', token)
        .send({ ...articleFixture, ...overrides });

export const promoteToAdmin = (userId) =>
    User.updateOne({ _id: userId }, { role: 'admin' });
