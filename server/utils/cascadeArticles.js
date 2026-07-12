import Comment from '../models/Comment.js';
import Like from '../models/Like.js';
import Bookmark from '../models/Bookmark.js';
import ReadArticle from '../models/ReadArticle.js';
import LearningPath from '../models/LearningPath.js';

export const cascadeArticleDelete = async (articleIds) => {
    const ids = Array.isArray(articleIds) ? articleIds : [articleIds];
    if (ids.length === 0) return;

    await Promise.all([
        Comment.deleteMany({ articleId: { $in: ids } }),
        Like.deleteMany({ articleId: { $in: ids } }),
        Bookmark.deleteMany({ articleId: { $in: ids } }),
        ReadArticle.deleteMany({ articleId: { $in: ids } }),
        LearningPath.updateMany(
            { articles: { $in: ids } },
            { $pull: { articles: { $in: ids } } },
        ),
    ]);
};
