import Article from '../models/Article.js';
import Comment from '../models/Comment.js';
import Bookmark from '../models/Bookmark.js';
import Like from '../models/Like.js';
import GlossaryTerm from '../models/GlossaryTerm.js';
import ReadArticle from '../models/ReadArticle.js';
import PasswordResetToken from '../models/PasswordResetToken.js';
import EmailVerificationToken from '../models/EmailVerificationToken.js';
import Report from '../models/Report.js';
import { cascadeArticleDelete } from './cascadeArticles.js';

export const cascadeUserDelete = async (userId) => {
    const [ownedArticles, ownedComments, ownedTerms] = await Promise.all([
        Article.find({ _ownerId: userId }).select('_id').lean(),
        Comment.find({ _ownerId: userId }).select('_id').lean(),
        GlossaryTerm.find({ _ownerId: userId }).select('_id').lean(),
    ]);
    const ownedArticleIds = ownedArticles.map((a) => a._id);

    await Promise.all([
        Article.deleteMany({ _ownerId: userId }),
        Comment.deleteMany({ _ownerId: userId }),
        Bookmark.deleteMany({ _ownerId: userId }),
        Like.deleteMany({ _ownerId: userId }),
        GlossaryTerm.deleteMany({ _ownerId: userId }),
        ReadArticle.deleteMany({ _ownerId: userId }),
        PasswordResetToken.deleteMany({ _ownerId: userId }),
        EmailVerificationToken.deleteMany({ _ownerId: userId }),
        Report.deleteMany({
            $or: [
                { _reporterId: userId },
                { targetType: 'article', targetId: { $in: ownedArticleIds } },
                { targetType: 'comment', targetId: { $in: ownedComments.map((c) => c._id) } },
                { targetType: 'glossary', targetId: { $in: ownedTerms.map((t) => t._id) } },
            ],
        }),
    ]);
    await cascadeArticleDelete(ownedArticleIds);
};
