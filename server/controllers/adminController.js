import mongoose from 'mongoose';
import User from '../models/User.js';
import Article from '../models/Article.js';
import Comment from '../models/Comment.js';
import GlossaryTerm from '../models/GlossaryTerm.js';
import Bookmark from '../models/Bookmark.js';
import Like from '../models/Like.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { escapeRegex } from '../utils/escapeRegex.js';
import { clampSearchTerm } from '../utils/searchTerm.js';
import { cascadeArticleDelete } from '../utils/cascadeArticles.js';
import { cascadeUserDelete } from '../utils/cascadeUserDelete.js';
import Report from '../models/Report.js';
import { hasEarnedTrust } from '../utils/trust.js';

export const getStats = asyncHandler(async (_req, res) => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const cutoffSeconds = Math.floor(sevenDaysAgo.getTime() / 1000);
    const cutoffId = mongoose.Types.ObjectId.createFromTime(cutoffSeconds);

    const [
        totalUsers,
        totalAdmins,
        usersLastWeek,
        totalArticles,
        publishedArticles,
        draftArticles,
        pendingArticles,
        featuredArticles,
        totalComments,
        commentsLastWeek,
        totalGlossaryTerms,
        pendingTerms,
        totalBookmarks,
        totalLikes,
    ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'admin' }),
        User.countDocuments({ _id: { $gte: cutoffId } }),
        Article.countDocuments(),
        Article.countDocuments({ status: 'published' }),
        Article.countDocuments({ status: 'draft' }),
        Article.countDocuments({ status: 'pending' }),
        Article.countDocuments({ featured: true }),
        Comment.countDocuments(),
        Comment.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
        GlossaryTerm.countDocuments(),
        GlossaryTerm.countDocuments({ status: 'pending' }),
        Bookmark.countDocuments(),
        Like.countDocuments(),
    ]);

    res.json({
        users: { total: totalUsers, admins: totalAdmins, lastWeek: usersLastWeek },
        articles: {
            total: totalArticles,
            published: publishedArticles,
            drafts: draftArticles,
            pending: pendingArticles,
            featured: featuredArticles,
        },
        comments: { total: totalComments, lastWeek: commentsLastWeek },
        glossary: { total: totalGlossaryTerms, pending: pendingTerms },
        bookmarks: { total: totalBookmarks },
        likes: { total: totalLikes },
    });
});

export const getUsers = asyncHandler(async (req, res) => {
    const { search = '', page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page) || 1;
    const limitNum = Math.min(parseInt(limit) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const filter = {};
    const trimmed = clampSearchTerm(search);
    if (trimmed) {
        const safe = escapeRegex(trimmed);
        filter.$or = [
            { username: { $regex: safe, $options: 'i' } },
            { email: { $regex: safe, $options: 'i' } },
        ];
    }

    const [users, total] = await Promise.all([
        User.find(filter)
            .select('-password +isTrusted +approvedArticles')
            .sort({ _id: -1 })
            .skip(skip)
            .limit(limitNum),
        User.countDocuments(filter),
    ]);

    res.json({
        users,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
    });
});

export const updateUserRole = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
        throw new AppError(400, 'Role must be "user" or "admin"');
    }
    if (String(userId) === String(req.user._id)) {
        throw new AppError(400, 'You cannot change your own role.');
    }

    const updated = await User.findByIdAndUpdate(
        userId,
        { role },
        { returnDocument: 'after', runValidators: true }
    ).select('-password');

    if (!updated) throw new AppError(404, 'User not found');
    res.json(updated);
});

export const deleteUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (String(userId) === String(req.user._id)) {
        throw new AppError(400, 'You cannot delete your own account here.');
    }

    const targetId = new mongoose.Types.ObjectId(userId);

    const user = await User.findByIdAndDelete(targetId);
    if (!user) throw new AppError(404, 'User not found');

    await cascadeUserDelete(targetId);

    res.json({ message: 'User and all their content deleted.' });
});

export const adminListArticles = asyncHandler(async (req, res) => {
    const { search = '', page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page) || 1;
    const limitNum = Math.min(parseInt(limit) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const filter = {};
    const trimmed = clampSearchTerm(search);
    if (trimmed) {
        const safe = escapeRegex(trimmed);
        filter.title = { $regex: safe, $options: 'i' };
    }

    const [articles, total] = await Promise.all([
        Article.find(filter)
            .select('title category status featured views createdAt _ownerId')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .populate('_ownerId', 'username'),
        Article.countDocuments(filter),
    ]);

    res.json({ articles, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
});

export const adminDeleteArticle = asyncHandler(async (req, res) => {
    const { articleId } = req.params;
    const deleted = await Article.findByIdAndDelete(articleId);
    if (!deleted) throw new AppError(404, 'Article not found');
    await cascadeArticleDelete(articleId);
    res.json({ message: 'Article deleted.' });
});

export const toggleFeaturedArticle = asyncHandler(async (req, res) => {
    const { articleId } = req.params;
    const article = await Article.findById(articleId).select('featured status');
    if (!article) throw new AppError(404, 'Article not found');
    if (article.status !== 'published') {
        throw new AppError(400, 'Only published articles can be featured.');
    }
    article.featured = !article.featured;
    await article.save();
    res.json({ _id: article._id, featured: article.featured });
});

export const getModerationQueue = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page) || 1;
    const limitNum = Math.min(parseInt(limit) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const [articles, articleTotal, terms, termTotal] = await Promise.all([
        Article.find({ status: 'pending' })
            .select('title category difficulty summary imageUrl readingTime createdAt _ownerId')
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(limitNum)
            .populate('_ownerId', 'username profilePicture'),
        Article.countDocuments({ status: 'pending' }),
        GlossaryTerm.find({ status: 'pending' })
            .select('term definition category createdAt _ownerId')
            .sort({ createdAt: 1 })
            .limit(limitNum)
            .populate('_ownerId', 'username'),
        GlossaryTerm.countDocuments({ status: 'pending' }),
    ]);

    res.json({
        articles,
        terms,
        articleTotal,
        termTotal,
        page: pageNum,
        totalPages: Math.ceil(articleTotal / limitNum),
    });
});

export const getArticlePreview = asyncHandler(async (req, res) => {
    const { articleId } = req.params;

    const article = await Article.findById(articleId)
        .populate('_ownerId', 'username profilePicture');
    if (!article) throw new AppError(404, 'Article not found');

    res.json(article);
});

const creditApproval = async (ownerId) => {
    const author = await User.findById(ownerId).select('+approvedArticles +isTrusted');
    if (!author) return;

    author.approvedArticles = await Article.countDocuments({
        _ownerId: ownerId,
        status: 'published',
    });
    if (!author.isTrusted && hasEarnedTrust(author.approvedArticles)) {
        author.isTrusted = true;
    }
    await author.save();
};

export const approveArticle = asyncHandler(async (req, res) => {
    const { articleId } = req.params;

    const article = await Article.findOneAndUpdate(
        { _id: articleId, status: 'pending' },
        { status: 'published', moderationNote: '' },
        { returnDocument: 'after', runValidators: true },
    );
    if (!article) throw new AppError(404, 'No pending article found with that id.');

    await creditApproval(article._ownerId);

    res.json({ _id: article._id, status: article.status });
});

export const rejectArticle = asyncHandler(async (req, res) => {
    const { articleId } = req.params;
    const note = typeof req.body?.note === 'string' ? req.body.note.trim().slice(0, 300) : '';

    const article = await Article.findOneAndUpdate(
        { _id: articleId, status: 'pending' },
        { status: 'draft', moderationNote: note, featured: false },
        { returnDocument: 'after', runValidators: true },
    );
    if (!article) throw new AppError(404, 'No pending article found with that id.');

    res.json({ _id: article._id, status: article.status, moderationNote: article.moderationNote });
});

export const approveGlossaryTerm = asyncHandler(async (req, res) => {
    const { termId } = req.params;

    const term = await GlossaryTerm.findOneAndUpdate(
        { _id: termId, status: 'pending' },
        { status: 'published' },
        { returnDocument: 'after', runValidators: true },
    );
    if (!term) throw new AppError(404, 'No pending term found with that id.');

    res.json({ _id: term._id, status: term.status });
});

export const adminDeleteGlossaryTerm = asyncHandler(async (req, res) => {
    const { termId } = req.params;
    const deleted = await GlossaryTerm.findByIdAndDelete(termId);
    if (!deleted) throw new AppError(404, 'Term not found');
    await Report.deleteMany({ targetType: 'glossary', targetId: termId });
    res.json({ message: 'Term deleted.' });
});

export const updateUserTrust = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { isTrusted } = req.body;

    if (typeof isTrusted !== 'boolean') {
        throw new AppError(400, 'isTrusted must be true or false.');
    }

    const updated = await User.findByIdAndUpdate(
        userId,
        { isTrusted },
        { returnDocument: 'after', runValidators: true },
    ).select('username +isTrusted +approvedArticles');

    if (!updated) throw new AppError(404, 'User not found');
    res.json({
        _id: updated._id,
        username: updated.username,
        isTrusted: updated.isTrusted,
        approvedArticles: updated.approvedArticles,
    });
});

const snapshotTargets = async (reports) => {
    const idsByType = { article: [], comment: [], glossary: [] };
    for (const report of reports) {
        idsByType[report.targetType]?.push(report.targetId);
    }

    const [articles, comments, terms] = await Promise.all([
        Article.find({ _id: { $in: idsByType.article } }).select('title status').lean(),
        Comment.find({ _id: { $in: idsByType.comment } }).select('text articleId').lean(),
        GlossaryTerm.find({ _id: { $in: idsByType.glossary } }).select('term status').lean(),
    ]);

    const lookup = new Map();
    for (const a of articles) lookup.set(`article:${a._id}`, { label: a.title, status: a.status });
    for (const c of comments) lookup.set(`comment:${c._id}`, { label: c.text, articleId: c.articleId });
    for (const t of terms) lookup.set(`glossary:${t._id}`, { label: t.term, status: t.status });

    return reports.map((report) => ({
        ...report,
        target: lookup.get(`${report.targetType}:${report.targetId}`) ?? null,
    }));
};

export const adminListReports = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, status = 'open' } = req.query;
    const pageNum = parseInt(page) || 1;
    const limitNum = Math.min(parseInt(limit) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const filter = ['open', 'resolved', 'dismissed'].includes(status) ? { status } : { status: 'open' };

    const [reports, total, openTotal] = await Promise.all([
        Report.find(filter)
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(limitNum)
            .populate('_reporterId', 'username')
            .lean(),
        Report.countDocuments(filter),
        Report.countDocuments({ status: 'open' }),
    ]);

    res.json({
        reports: await snapshotTargets(reports),
        total,
        openTotal,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
    });
});

export const resolveReport = asyncHandler(async (req, res) => {
    const { reportId } = req.params;
    const { status } = req.body;

    const updated = await Report.findByIdAndUpdate(
        reportId,
        { status },
        { returnDocument: 'after', runValidators: true },
    );
    if (!updated) throw new AppError(404, 'Report not found');

    res.json({ _id: updated._id, status: updated.status });
});

export const adminListComments = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page) || 1;
    const limitNum = Math.min(parseInt(limit) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const [comments, total] = await Promise.all([
        Comment.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .populate('_ownerId', 'username profilePicture')
            .populate('articleId', 'title'),
        Comment.countDocuments(),
    ]);

    res.json({ comments, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
});

export const adminDeleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const deleted = await Comment.findByIdAndDelete(commentId);
    if (!deleted) throw new AppError(404, 'Comment not found');
    await Report.deleteMany({ targetType: 'comment', targetId: commentId });
    res.json({ message: 'Comment deleted.' });
});
