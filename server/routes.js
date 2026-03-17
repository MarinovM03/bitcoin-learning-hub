import { Router } from 'express';
import { requireAuth } from './middlewares/requireAuth.js';
import * as articleController from './controllers/articleController.js';
import * as authController from './controllers/authController.js';
import * as likeController from './controllers/likeController.js';
import * as glossaryController from './controllers/glossaryController.js';
import * as commentController from './controllers/commentController.js';
import * as bookmarkController from './controllers/bookmarkController.js';

const router = Router();

// Article routes
router.get('/articles/my', requireAuth, articleController.getMyArticles);
router.get('/articles', articleController.getAll);
router.get('/articles/:articleId', articleController.getOne);
router.post('/articles', requireAuth, articleController.create);
router.put('/articles/:articleId', requireAuth, articleController.update);
router.delete('/articles/:articleId', requireAuth, articleController.remove);

// Auth routes
router.post('/users/register', authController.register);
router.post('/users/login', authController.login);
router.post('/users/logout', authController.logout);
router.get('/users/profile', requireAuth, authController.getProfile);
router.put('/users/profile', requireAuth, authController.updateProfile);

// Like routes
router.post('/likes', requireAuth, likeController.likeArticle);
router.get('/likes/:articleId', likeController.getLikes);

// Bookmark routes
router.post('/bookmarks', requireAuth, bookmarkController.toggle);
router.get('/bookmarks', requireAuth, bookmarkController.getMyBookmarks);

// Glossary routes
router.get('/glossary', glossaryController.getAll);
router.post('/glossary', requireAuth, glossaryController.create);
router.delete('/glossary/:termId', requireAuth, glossaryController.remove);

// Comment routes
router.get('/comments/:articleId', commentController.getAllForArticle);
router.post('/comments', requireAuth, commentController.create);
router.delete('/comments/:commentId', requireAuth, commentController.remove);

export default router;