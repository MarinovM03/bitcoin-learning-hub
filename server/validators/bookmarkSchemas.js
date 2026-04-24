import { z } from 'zod';
import { objectId } from './shared.js';

export const toggleBookmarkSchema = z.object({
    articleId: objectId,
});
