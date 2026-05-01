import { Router } from 'express';
import { requireAuth } from './middlewares/requireAuth.js';
import { requireAdmin } from './middlewares/requireAdmin.js';
import { validate } from './middlewares/validate.js';
import * as articleController from './controllers/articleController.js';
import * as authController from './controllers/authController.js';
import * as learningPathController from './controllers/learningPathController.js';
import * as likeController from './controllers/likeController.js';
import * as glossaryController from './controllers/glossaryController.js';
import * as commentController from './controllers/commentController.js';
import * as bookmarkController from './controllers/bookmarkController.js';
import * as pathCertificationController from './controllers/pathCertificationController.js';
import * as adminController from './controllers/adminController.js';
import Article from './models/Article.js';
import GlossaryTerm from './models/GlossaryTerm.js';
import { AppError } from './utils/AppError.js';
import { asyncHandler } from './utils/asyncHandler.js';
import { registerSchema, loginSchema, updateProfileSchema } from './validators/authSchemas.js';
import { createArticleSchema, updateArticleSchema } from './validators/articleSchemas.js';
import { createGlossarySchema } from './validators/glossarySchemas.js';
import { createCommentSchema } from './validators/commentSchemas.js';
import { likeArticleSchema } from './validators/likeSchemas.js';
import { toggleBookmarkSchema } from './validators/bookmarkSchemas.js';
import { createPathSchema, updatePathSchema, submitQuizSchema } from './validators/pathSchemas.js';
import {
    articleIdParam,
    pathIdParam,
    termIdParam,
    commentIdParam,
    certIdParam,
    userIdParam,
} from './validators/shared.js';

const router = Router();

// Article routes
router.get('/articles/my', requireAuth, articleController.getMyArticles);
router.get('/articles/series/mine', requireAuth, articleController.getMySeriesParts);
router.get('/articles/trending', articleController.getTrending);
router.get('/articles', articleController.getAll);
router.get('/articles/:articleId/related', validate({ params: articleIdParam }), articleController.getRelated);
router.get('/articles/:articleId/series', validate({ params: articleIdParam }), articleController.getSeries);
router.get('/articles/:articleId', validate({ params: articleIdParam }), articleController.getOne);
router.post('/articles/:articleId/read', requireAuth, validate({ params: articleIdParam }), articleController.markRead);
router.delete('/articles/:articleId/read', requireAuth, validate({ params: articleIdParam }), articleController.markUnread);
router.post('/articles', requireAuth, validate({ body: createArticleSchema }), articleController.create);
router.put('/articles/:articleId', requireAuth, validate({ params: articleIdParam, body: updateArticleSchema }), articleController.update);
router.delete('/articles/:articleId', requireAuth, validate({ params: articleIdParam }), articleController.remove);

// Learning path routes
router.get('/paths/my', requireAuth, learningPathController.getMyPaths);
router.get('/paths', learningPathController.getAll);
router.get('/paths/:pathId/quiz', requireAuth, validate({ params: pathIdParam }), pathCertificationController.getQuiz);
router.post('/paths/:pathId/quiz', requireAuth, validate({ params: pathIdParam, body: submitQuizSchema }), pathCertificationController.submitQuiz);
router.get('/paths/:pathId', validate({ params: pathIdParam }), learningPathController.getOne);
router.post('/paths', requireAuth, validate({ body: createPathSchema }), learningPathController.create);
router.put('/paths/:pathId', requireAuth, validate({ params: pathIdParam, body: updatePathSchema }), learningPathController.update);
router.delete('/paths/:pathId', requireAuth, validate({ params: pathIdParam }), learningPathController.remove);

// Reading history
router.delete('/users/me/read-history', requireAuth, articleController.resetReadHistory);

// Path certification routes
router.get('/users/me/certifications', requireAuth, pathCertificationController.getMyCertifications);
router.get('/certifications/:certId', requireAuth, validate({ params: certIdParam }), pathCertificationController.getOneCertification);

// Auth routes
router.post('/users/register', validate({ body: registerSchema }), authController.register);
router.post('/users/login', validate({ body: loginSchema }), authController.login);
router.post('/users/logout', authController.logout);
router.get('/users/profile', requireAuth, authController.getProfile);
router.put('/users/profile', requireAuth, validate({ body: updateProfileSchema }), authController.updateProfile);
router.get('/users/:userId/public', validate({ params: userIdParam }), articleController.getPublicProfile);

// Like routes
router.post('/likes', requireAuth, validate({ body: likeArticleSchema }), likeController.likeArticle);
router.get('/likes/:articleId', validate({ params: articleIdParam }), likeController.getLikes);

// Bookmark routes
router.post('/bookmarks', requireAuth, validate({ body: toggleBookmarkSchema }), bookmarkController.toggle);
router.get('/bookmarks', requireAuth, bookmarkController.getMyBookmarks);

// Glossary routes
router.get('/glossary', glossaryController.getAll);
router.get('/glossary/:termId', validate({ params: termIdParam }), glossaryController.getOne);
router.post('/glossary', requireAuth, validate({ body: createGlossarySchema }), glossaryController.create);
router.delete('/glossary/:termId', requireAuth, validate({ params: termIdParam }), glossaryController.remove);

// Comment routes
router.get('/comments/:articleId', validate({ params: articleIdParam }), commentController.getAllForArticle);
router.post('/comments', requireAuth, validate({ body: createCommentSchema }), commentController.create);
router.delete('/comments/:commentId', requireAuth, validate({ params: commentIdParam }), commentController.remove);

// Admin routes — all require admin role
router.get('/admin/stats', requireAuth, requireAdmin, adminController.getStats);
router.get('/admin/users', requireAuth, requireAdmin, adminController.getUsers);
router.patch('/admin/users/:userId/role', requireAuth, requireAdmin, validate({ params: userIdParam }), adminController.updateUserRole);
router.delete('/admin/users/:userId', requireAuth, requireAdmin, validate({ params: userIdParam }), adminController.deleteUser);
router.get('/admin/articles', requireAuth, requireAdmin, adminController.adminListArticles);
router.delete('/admin/articles/:articleId', requireAuth, requireAdmin, validate({ params: articleIdParam }), adminController.adminDeleteArticle);
router.patch('/admin/articles/:articleId/featured', requireAuth, requireAdmin, validate({ params: articleIdParam }), adminController.toggleFeaturedArticle);
router.get('/admin/comments', requireAuth, requireAdmin, adminController.adminListComments);
router.delete('/admin/comments/:commentId', requireAuth, requireAdmin, validate({ params: commentIdParam }), adminController.adminDeleteComment);

// Search route — unified substring search across articles and glossary
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const extractSnippet = (text, query, maxLen = 180) => {
    if (!text || !query) return '';
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const matchAt = lowerText.indexOf(lowerQuery);
    if (matchAt === -1) return '';

    const queryLen = query.length;
    const contextRoom = Math.max(0, maxLen - queryLen);
    const half = Math.floor(contextRoom / 2);
    let start = Math.max(0, matchAt - half);
    let end = Math.min(text.length, matchAt + queryLen + half);

    // Snap to word boundaries when possible to avoid breaking words
    if (start > 0) {
        const space = text.lastIndexOf(' ', start);
        if (space !== -1 && start - space < 25) start = space + 1;
    }
    if (end < text.length) {
        const space = text.indexOf(' ', end);
        if (space !== -1 && space - end < 25) end = space;
    }

    let snippet = text.slice(start, end).trim();
    if (start > 0) snippet = '… ' + snippet;
    if (end < text.length) snippet = snippet + ' …';
    return snippet;
};

router.get('/search', asyncHandler(async (req, res) => {
    const rawQuery = (req.query.q || '').toString().trim();
    const limit = Math.min(parseInt(req.query.limit || '10', 10) || 10, 25);

    if (rawQuery.length < 2) {
        return res.json({ query: rawQuery, articles: [], glossary: [] });
    }

    const pattern = new RegExp(escapeRegex(rawQuery), 'i');
    const overfetch = limit * 3;

    const [articles, glossary] = await Promise.all([
        Article.find(
            {
                status: 'published',
                $or: [
                    { title: pattern },
                    { summary: pattern },
                    { content: pattern },
                ],
            },
            { title: 1, summary: 1, content: 1, category: 1, difficulty: 1, imageUrl: 1, readingTime: 1, _ownerId: 1 }
        )
            .limit(overfetch)
            .lean(),
        GlossaryTerm.find(
            {
                $or: [
                    { term: pattern },
                    { definition: pattern },
                ],
            },
            { term: 1, definition: 1, category: 1 }
        )
            .limit(overfetch)
            .lean(),
    ]);

    const matches = (hay) => Boolean(hay) && hay.toLowerCase().includes(rawQuery.toLowerCase());
    const rank = (hay, weight) => (matches(hay) ? weight : 0);

    const rankedArticles = articles
        .map((a) => ({
            article: a,
            score: rank(a.title, 10) + rank(a.summary, 5) + rank(a.content, 1),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(({ article }) => {
            const titleHit = matches(article.title);
            const summaryHit = matches(article.summary);
            const contentHit = matches(article.content);
            const contentSnippet = (!titleHit && !summaryHit && contentHit)
                ? extractSnippet(article.content, rawQuery)
                : '';
            const { content, ...rest } = article;
            return contentSnippet ? { ...rest, contentSnippet } : rest;
        });

    const rankedGlossary = glossary
        .map((g) => ({
            term: g,
            score: rank(g.term, 10) + rank(g.definition, 2),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(({ term }) => term);

    res.json({ query: rawQuery, articles: rankedArticles, glossary: rankedGlossary });
}));

// Proxy routes — server-side fetches to avoid browser CORS/rate-limit issues
let btcGlobalCache = { data: null, timestamp: 0 };
const BTC_GLOBAL_TTL_MS = 60_000;

router.get('/proxy/btc-global', asyncHandler(async (req, res) => {
    const now = Date.now();
    if (btcGlobalCache.data && now - btcGlobalCache.timestamp < BTC_GLOBAL_TTL_MS) {
        return res.json(btcGlobalCache.data);
    }
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/global');
        if (!response.ok) {
            if (btcGlobalCache.data) return res.json(btcGlobalCache.data);
            throw new AppError(response.status, 'CoinGecko request failed');
        }
        const data = await response.json();
        btcGlobalCache = { data, timestamp: now };
        res.json(data);
    } catch (err) {
        if (btcGlobalCache.data) return res.json(btcGlobalCache.data);
        if (err instanceof AppError) throw err;
        throw new AppError(502, 'Failed to reach CoinGecko');
    }
}));

export default router;
