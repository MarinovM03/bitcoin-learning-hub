import Article from '../models/Article.js';
import Comment from '../models/Comment.js';
import Bookmark from '../models/Bookmark.js';
import Like from '../models/Like.js';
import GlossaryTerm from '../models/GlossaryTerm.js';
import LearningPath from '../models/LearningPath.js';
import ReadArticle from '../models/ReadArticle.js';
import PathCertification from '../models/PathCertification.js';
import PasswordResetToken from '../models/PasswordResetToken.js';
import { cascadeArticleDelete } from './cascadeArticles.js';

export const cascadeUserDelete = async (userId) => {
    const ownedArticles = await Article.find({ _ownerId: userId }).select('_id');
    const ownedArticleIds = ownedArticles.map((a) => a._id);

    await Promise.all([
        Article.deleteMany({ _ownerId: userId }),
        Comment.deleteMany({ _ownerId: userId }),
        Bookmark.deleteMany({ _ownerId: userId }),
        Like.deleteMany({ _ownerId: userId }),
        GlossaryTerm.deleteMany({ _ownerId: userId }),
        LearningPath.deleteMany({ _ownerId: userId }),
        ReadArticle.deleteMany({ _ownerId: userId }),
        PathCertification.deleteMany({ _ownerId: userId }),
        PasswordResetToken.deleteMany({ _ownerId: userId }),
    ]);
    await cascadeArticleDelete(ownedArticleIds);
};
