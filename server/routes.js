import { Router } from 'express';
import { requireAuth } from './middlewares/requireAuth.js';
import * as articleController from './controllers/articleController.js';
import * as authController from './controllers/authController.js';
import * as learningPathController from './controllers/learningPathController.js';
import * as likeController from './controllers/likeController.js';
import * as glossaryController from './controllers/glossaryController.js';
import * as commentController from './controllers/commentController.js';
import * as bookmarkController from './controllers/bookmarkController.js';
import * as pathCertificationController from './controllers/pathCertificationController.js';
import Article from './models/Article.js';
import GlossaryTerm from './models/GlossaryTerm.js';

const router = Router();

// Article routes
router.get('/articles/my', requireAuth, articleController.getMyArticles);
router.get('/articles/series/mine', requireAuth, articleController.getMySeriesParts);
router.get('/articles/trending', articleController.getTrending);
router.get('/articles', articleController.getAll);
router.get('/articles/:articleId/related', articleController.getRelated);
router.get('/articles/:articleId/series', articleController.getSeries);
router.get('/articles/:articleId', articleController.getOne);
router.post('/articles/:articleId/read', requireAuth, articleController.markRead);
router.delete('/articles/:articleId/read', requireAuth, articleController.markUnread);
router.post('/articles', requireAuth, articleController.create);
router.put('/articles/:articleId', requireAuth, articleController.update);
router.delete('/articles/:articleId', requireAuth, articleController.remove);

// Learning path routes
router.get('/paths/my', requireAuth, learningPathController.getMyPaths);
router.get('/paths', learningPathController.getAll);
router.get('/paths/:pathId/quiz', requireAuth, pathCertificationController.getQuiz);
router.post('/paths/:pathId/quiz', requireAuth, pathCertificationController.submitQuiz);
router.get('/paths/:pathId', learningPathController.getOne);
router.post('/paths', requireAuth, learningPathController.create);
router.put('/paths/:pathId', requireAuth, learningPathController.update);
router.delete('/paths/:pathId', requireAuth, learningPathController.remove);

// Path certification routes
router.get('/users/me/certifications', requireAuth, pathCertificationController.getMyCertifications);
router.get('/certifications/:certId', requireAuth, pathCertificationController.getOneCertification);

// Auth routes
router.post('/users/register', authController.register);
router.post('/users/login', authController.login);
router.post('/users/logout', authController.logout);
router.get('/users/profile', requireAuth, authController.getProfile);
router.put('/users/profile', requireAuth, authController.updateProfile);
router.get('/users/:userId/public', articleController.getPublicProfile);

// Like routes
router.post('/likes', requireAuth, likeController.likeArticle);
router.get('/likes/:articleId', likeController.getLikes);

// Bookmark routes
router.post('/bookmarks', requireAuth, bookmarkController.toggle);
router.get('/bookmarks', requireAuth, bookmarkController.getMyBookmarks);

// Glossary routes
router.get('/glossary', glossaryController.getAll);
router.get('/glossary/:termId', glossaryController.getOne);
router.post('/glossary', requireAuth, glossaryController.create);
router.delete('/glossary/:termId', requireAuth, glossaryController.remove);

// Comment routes
router.get('/comments/:articleId', commentController.getAllForArticle);
router.post('/comments', requireAuth, commentController.create);
router.delete('/comments/:commentId', requireAuth, commentController.remove);

// Search route — unified substring search across articles and glossary
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

router.get('/search', async (req, res) => {
    const rawQuery = (req.query.q || '').toString().trim();
    const limit = Math.min(parseInt(req.query.limit || '10', 10) || 10, 25);

    if (rawQuery.length < 2) {
        return res.json({ query: rawQuery, articles: [], glossary: [] });
    }

    try {
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

        const rank = (hay, weight) => (hay && pattern.test(hay) ? weight : 0);
        const rankedArticles = articles
            .map((a) => ({
                article: a,
                score: rank(a.title, 10) + rank(a.summary, 5) + rank(a.content, 1),
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(({ article }) => {
                // strip content from payload — only used for ranking
                const { content, ...rest } = article;
                return rest;
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
    } catch (err) {
        console.error('Search failed:', err.message);
        res.status(500).json({ error: 'Search failed' });
    }
});

// Proxy routes — server-side fetches to avoid browser CORS/rate-limit issues
let btcGlobalCache = { data: null, timestamp: 0 };
const BTC_GLOBAL_TTL_MS = 60_000;

router.get('/proxy/btc-global', async (req, res) => {
    const now = Date.now();
    if (btcGlobalCache.data && now - btcGlobalCache.timestamp < BTC_GLOBAL_TTL_MS) {
        return res.json(btcGlobalCache.data);
    }
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/global');
        if (!response.ok) {
            if (btcGlobalCache.data) return res.json(btcGlobalCache.data);
            return res.status(response.status).json({ error: 'CoinGecko request failed' });
        }
        const data = await response.json();
        btcGlobalCache = { data, timestamp: now };
        res.json(data);
    } catch {
        if (btcGlobalCache.data) return res.json(btcGlobalCache.data);
        res.status(502).json({ error: 'Failed to reach CoinGecko' });
    }
});

export default router;