import { z } from 'zod';
import { objectId } from './shared.js';

export const likeArticleSchema = z.object({
    articleId: objectId,
});
