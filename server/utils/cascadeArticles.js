import Comment from '../models/Comment.js';
import Like from '../models/Like.js';
import Bookmark from '../models/Bookmark.js';
import ReadArticle from '../models/ReadArticle.js';
import Report from '../models/Report.js';

export const cascadeArticleDelete = async (articleIds) => {
    const ids = Array.isArray(articleIds) ? articleIds : [articleIds];
    if (ids.length === 0) return;

    const doomedComments = await Comment.find({ articleId: { $in: ids } }).select('_id').lean();
    const commentIds = doomedComments.map((c) => c._id);

    await Promise.all([
        Comment.deleteMany({ articleId: { $in: ids } }),
        Like.deleteMany({ articleId: { $in: ids } }),
        Bookmark.deleteMany({ articleId: { $in: ids } }),
        ReadArticle.deleteMany({ articleId: { $in: ids } }),
        Report.deleteMany({
            $or: [
                { targetType: 'article', targetId: { $in: ids } },
                { targetType: 'comment', targetId: { $in: commentIds } },
            ],
        }),
    ]);
};
