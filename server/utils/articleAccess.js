import Article from '../models/Article.js';
import { AppError } from './AppError.js';

export const requireAccessibleArticle = async (articleId, userId) => {
    const article = await Article.findById(articleId).select('status _ownerId');
    const isOwner = userId && article && String(article._ownerId) === String(userId);
    if (!article || (article.status === 'draft' && !isOwner)) {
        throw new AppError(404, 'Article not found');
    }
    return article;
};
