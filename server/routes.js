import { Router } from 'express';
import * as articleController from './controllers/articleController.js';
import * as authController from './controllers/authController.js';

const router = Router();

router.get('/articles', articleController.getAll);
router.post('/articles', articleController.create);

router.post('/users/register', authController.register);
router.post('/users/login', authController.login);
router.post('/users/logout', authController.logout);
router.get('/users/logout', authController.logout);

export default router;