import { describe, it, expect, afterEach } from 'vitest';
import request from 'supertest';
import crypto from 'node:crypto';
import {
    app,
    register,
    login,
    registerAndToken,
    createArticle,
    userFixtures,
    glossaryFixture,
} from './helpers.js';
import User from '../models/User.js';
import EmailVerificationToken from '../models/EmailVerificationToken.js';

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const issueToken = async (user, { expired = false, email } = {}) => {
    const rawToken = crypto.randomBytes(32).toString('hex');
    await EmailVerificationToken.create({
        _ownerId: user._id,
        tokenHash: hashToken(rawToken),
        email: email ?? user.email,
        expiresAt: new Date(Date.now() + (expired ? -60_000 : 60_000)),
    });
    return rawToken;
};

const verifyEmail = (token) =>
    request(app()).post('/users/verify-email').send({ token });

describe('registration and verification state', () => {
    it('creates an unverified account and issues a verification token', async () => {
        const res = await register();
        expect(res.status).toBe(200);
        expect(res.body.emailVerified).toBe(false);

        const tokens = await EmailVerificationToken.find({ _ownerId: res.body._id });
        expect(tokens).toHaveLength(1);
        expect(tokens[0].expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('confirms the address with a valid token and clears the token', async () => {
        const { token } = await registerAndToken({}, { verified: false });
        const user = await User.findOne({ email: userFixtures.primary.email });
        const rawToken = await issueToken(user);

        const res = await verifyEmail(rawToken);
        expect(res.status).toBe(200);
        expect(res.body.emailVerified).toBe(true);

        const stored = await User.findById(user._id);
        expect(stored.emailVerified).toBe(true);
        expect(await EmailVerificationToken.countDocuments({ _ownerId: user._id })).toBe(0);
        expect(token).toBeTypeOf('string');
    });

    it('rejects an expired token', async () => {
        await register();
        const user = await User.findOne({ email: userFixtures.primary.email });
        const rawToken = await issueToken(user, { expired: true });

        const res = await verifyEmail(rawToken);
        expect(res.status).toBe(400);
        expect((await User.findById(user._id)).emailVerified).toBe(false);
    });

    it('rejects an unknown token', async () => {
        const res = await verifyEmail(crypto.randomBytes(32).toString('hex'));
        expect(res.status).toBe(400);
    });

    it('refuses a token minted for a since-changed address', async () => {
        await register();
        const user = await User.findOne({ email: userFixtures.primary.email });
        const rawToken = await issueToken(user, { email: 'stale@example.com' });

        const res = await verifyEmail(rawToken);
        expect(res.status).toBe(400);
        expect((await User.findById(user._id)).emailVerified).toBe(false);
    });

    it('does not accept the same token twice', async () => {
        await register();
        const user = await User.findOne({ email: userFixtures.primary.email });
        const rawToken = await issueToken(user);

        expect((await verifyEmail(rawToken)).status).toBe(200);
        expect((await verifyEmail(rawToken)).status).toBe(400);
    });
});

describe('publishing requires a confirmed address', () => {
    it('blocks article creation until confirmed, then allows it', async () => {
        const { token, user } = await registerAndToken({}, { verified: false });

        const blocked = await createArticle(token);
        expect(blocked.status).toBe(403);
        expect(blocked.body.message).toMatch(/confirm your email/i);

        const rawToken = await issueToken(user);
        await verifyEmail(rawToken);

        const allowed = await createArticle(token);
        expect(allowed.status).toBe(201);
    });

    it('blocks comments and glossary terms until confirmed', async () => {
        const { token: authorToken } = await registerAndToken();
        const article = await createArticle(authorToken);

        const { token } = await registerAndToken(userFixtures.secondary, { verified: false });

        const comment = await request(app())
            .post('/comments')
            .set('Cookie', token)
            .send({ articleId: article.body._id, text: 'Nice write-up.' });
        expect(comment.status).toBe(403);

        const term = await request(app())
            .post('/glossary')
            .set('Cookie', token)
            .send(glossaryFixture);
        expect(term.status).toBe(403);
    });

    it('still allows reading, liking and bookmarking while unconfirmed', async () => {
        const { token: authorToken } = await registerAndToken();
        const article = await createArticle(authorToken);

        const { token } = await registerAndToken(userFixtures.secondary, { verified: false });

        const like = await request(app())
            .post('/likes')
            .set('Cookie', token)
            .send({ articleId: article.body._id });
        expect(like.status).toBe(201);
        expect(like.body.liked).toBe(true);

        const bookmark = await request(app())
            .post('/bookmarks')
            .set('Cookie', token)
            .send({ articleId: article.body._id });
        expect(bookmark.status).toBe(201);
        expect(bookmark.body.bookmarked).toBe(true);

        const read = await request(app())
            .post(`/articles/${article.body._id}/read`)
            .set('Cookie', token);
        expect(read.status).toBeLessThan(400);
    });
});

describe('POST /users/resend-verification', () => {
    it('requires authentication', async () => {
        const res = await request(app()).post('/users/resend-verification');
        expect(res.status).toBe(401);
    });

    it('mints a fresh token for an unconfirmed account', async () => {
        const { token, user } = await registerAndToken({}, { verified: false });
        await EmailVerificationToken.deleteMany({ _ownerId: user._id });

        const res = await request(app())
            .post('/users/resend-verification')
            .set('Cookie', token);
        expect(res.status).toBe(200);
        expect(await EmailVerificationToken.countDocuments({ _ownerId: user._id })).toBe(1);
    });

    it('rejects a request from an already confirmed account', async () => {
        const { token } = await registerAndToken();
        const res = await request(app())
            .post('/users/resend-verification')
            .set('Cookie', token);
        expect(res.status).toBe(400);
    });

    it('throttles back-to-back resends for the same account', async () => {
        const { token } = await registerAndToken({}, { verified: false });

        const res = await request(app())
            .post('/users/resend-verification')
            .set('Cookie', token);
        expect(res.status).toBe(429);
        expect(res.body.message).toMatch(/try again in a minute/i);
    });
});

describe('changing the email address', () => {
    it('drops confirmed status and issues a new token', async () => {
        const { token, user } = await registerAndToken();

        const res = await request(app())
            .put('/users/profile')
            .set('Cookie', token)
            .send({ email: 'changed@example.com', currentPassword: userFixtures.primary.password });
        expect(res.status).toBe(200);
        expect(res.body.emailVerified).toBe(false);

        expect((await User.findById(user._id)).emailVerified).toBe(false);
        expect(await EmailVerificationToken.countDocuments({ _ownerId: user._id })).toBe(1);
    });

    it('blocks publishing again until the new address is confirmed', async () => {
        const { token } = await registerAndToken();

        await request(app())
            .put('/users/profile')
            .set('Cookie', token)
            .send({ email: 'changed@example.com', currentPassword: userFixtures.primary.password });

        const blocked = await createArticle(token);
        expect(blocked.status).toBe(403);
    });
});

describe('ADMIN_EMAILS promotion', () => {
    afterEach(() => {
        delete process.env.ADMIN_EMAILS;
    });

    it('does not grant admin on registration alone', async () => {
        process.env.ADMIN_EMAILS = userFixtures.primary.email;

        const res = await register();
        expect(res.status).toBe(200);
        expect(res.body.role).toBe('user');
        expect((await User.findById(res.body._id)).role).toBe('user');
    });

    it('does not grant admin on login while unconfirmed', async () => {
        process.env.ADMIN_EMAILS = userFixtures.primary.email;
        await register();

        const res = await login();
        expect(res.status).toBe(200);
        expect(res.body.role).toBe('user');
    });

    it('grants admin once the address is confirmed', async () => {
        process.env.ADMIN_EMAILS = userFixtures.primary.email;
        await register();
        const user = await User.findOne({ email: userFixtures.primary.email });
        const rawToken = await issueToken(user);

        const res = await verifyEmail(rawToken);
        expect(res.status).toBe(200);
        expect(res.body.role).toBe('admin');
        expect((await User.findById(user._id)).role).toBe('admin');
    });

    it('leaves accounts outside the allowlist untouched', async () => {
        process.env.ADMIN_EMAILS = 'someone-else@example.com';
        await register();
        const user = await User.findOne({ email: userFixtures.primary.email });
        const rawToken = await issueToken(user);

        const res = await verifyEmail(rawToken);
        expect(res.body.role).toBe('user');
    });
});
