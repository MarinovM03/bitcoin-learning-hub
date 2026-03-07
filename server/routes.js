import { Router } from 'express';
import * as articleController from './controllers/articleController.js';
import * as authController from './controllers/authController.js';
import * as likeController from './controllers/likeController.js';
import * as glossaryController from './controllers/glossaryController.js';
import * as commentController from './controllers/commentController.js';

const router = Router();

// Article routes
router.get('/articles/my', articleController.getMyArticles);
router.get('/articles', articleController.getAll);
router.get('/articles/:articleId', articleController.getOne);
router.post('/articles', articleController.create);
router.put('/articles/:articleId', articleController.update);
router.delete('/articles/:articleId', articleController.remove);

// Auth routes
router.post('/users/register', authController.register);
router.post('/users/login', authController.login);
router.post('/users/logout', authController.logout);
router.get('/users/logout', authController.logout);
router.get('/users/profile', authController.getProfile);
router.put('/users/profile', authController.updateProfile);

// Like routes
router.post('/likes', likeController.likeArticle);
router.get('/likes/:articleId', likeController.getLikes);

// Glossary routes
router.get('/glossary', glossaryController.getAll);
router.post('/glossary', glossaryController.create);
router.delete('/glossary/:termId', glossaryController.remove);

// Comment routes
router.get('/comments/:articleId', commentController.getAllForArticle);
router.post('/comments', commentController.create);
router.delete('/comments/:commentId', commentController.remove);

export default router;