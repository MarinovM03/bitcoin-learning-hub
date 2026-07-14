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
import * as searchController from './controllers/searchController.js';
import * as marketController from './controllers/marketController.js';
import mongoose from 'mongoose';
import {
    registerSchema,
    loginSchema,
    updateProfileSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    deleteAccountSchema,
} from './validators/authSchemas.js';
import { createArticleSchema, updateArticleSchema, checkQuizAnswerSchema } from './validators/articleSchemas.js';
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

router.get('/health', (_req, res) => {
    const isDbReady = mongoose.connection.readyState === 1;
    res.status(isDbReady ? 200 : 503).json({
        status: isDbReady ? 'ok' : 'degraded',
    });
});

// Article routes
router.get('/articles/my', requireAuth, articleController.getMyArticles);
router.get('/articles/series/mine', requireAuth, articleController.getMySeriesParts);
router.get('/articles/trending', articleController.getTrending);
router.get('/articles', articleController.getAll);
router.get('/articles/:articleId/related', validate({ params: articleIdParam }), articleController.getRelated);
router.get('/articles/:articleId/series', validate({ params: articleIdParam }), articleController.getSeries);
router.get('/articles/:articleId', validate({ params: articleIdParam }), articleController.getOne);
router.post('/articles/:articleId/quiz/check', validate({ params: articleIdParam, body: checkQuizAnswerSchema }), articleController.checkQuizAnswer);
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

// Account deletion
router.delete('/users/me', requireAuth, validate({ body: deleteAccountSchema }), authController.deleteAccount);

// Path certification routes
router.get('/users/me/certifications', requireAuth, pathCertificationController.getMyCertifications);
router.get('/certifications/:certId', requireAuth, validate({ params: certIdParam }), pathCertificationController.getOneCertification);

// Auth routes
router.post('/users/register', validate({ body: registerSchema }), authController.register);
router.post('/users/login', validate({ body: loginSchema }), authController.login);
router.post('/users/logout', authController.logout);
router.post('/users/forgot-password', validate({ body: forgotPasswordSchema }), authController.forgotPassword);
router.post('/users/reset-password', validate({ body: resetPasswordSchema }), authController.resetPassword);
router.get('/users/profile', requireAuth, authController.getProfile);
router.put('/users/profile', requireAuth, validate({ body: updateProfileSchema }), authController.updateProfile);
router.get('/users/:userId/public', validate({ params: userIdParam }), articleController.getPublicProfile);

// Like routes
router.post('/likes', requireAuth, validate({ body: likeArticleSchema }), likeController.toggleLike);
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

// Admin routes — requireAdmin verifies both the session and the role in one
// lookup, so it mounts alone on the prefix
router.use('/admin', requireAdmin);
router.get('/admin/stats', adminController.getStats);
router.get('/admin/users', adminController.getUsers);
router.patch('/admin/users/:userId/role', validate({ params: userIdParam }), adminController.updateUserRole);
router.delete('/admin/users/:userId', validate({ params: userIdParam }), adminController.deleteUser);
router.get('/admin/articles', adminController.adminListArticles);
router.delete('/admin/articles/:articleId', validate({ params: articleIdParam }), adminController.adminDeleteArticle);
router.patch('/admin/articles/:articleId/featured', validate({ params: articleIdParam }), adminController.toggleFeaturedArticle);
router.get('/admin/comments', adminController.adminListComments);
router.delete('/admin/comments/:commentId', validate({ params: commentIdParam }), adminController.adminDeleteComment);

// Search route
router.get('/search', searchController.search);

// Market data proxy
router.get('/proxy/btc-global', marketController.getBtcGlobal);

export default router;
