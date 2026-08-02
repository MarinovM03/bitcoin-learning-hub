import Article from '../models/Article.js';
import { AppError } from './AppError.js';

export const isArticleVisibleTo = (article, userId) => {
    if (!article) return false;
    if (article.status === 'published') return true;

    const ownerId = article._ownerId?._id ?? article._ownerId;
    return Boolean(userId) && String(ownerId) === String(userId);
};

export const requireAccessibleArticle = async (articleId, userId) => {
    const article = await Article.findById(articleId).select('status _ownerId');
    if (!isArticleVisibleTo(article, userId)) {
        throw new AppError(404, 'Article not found');
    }
    return article;
};
