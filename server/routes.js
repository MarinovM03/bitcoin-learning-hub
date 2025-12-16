import { Router } from 'express';
import * as articleController from './controllers/articleController.js';

const router = Router();

router.get('/articles', articleController.getAll);
router.post('/articles', articleController.create);

export default router;