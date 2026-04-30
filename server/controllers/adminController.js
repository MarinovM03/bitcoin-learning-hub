import mongoose from 'mongoose';
import User from '../models/User.js';
import Article from '../models/Article.js';
import Comment from '../models/Comment.js';
import GlossaryTerm from '../models/GlossaryTerm.js';
import LearningPath from '../models/LearningPath.js';
import Bookmark from '../models/Bookmark.js';
import Like from '../models/Like.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

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
        featuredArticles,
        totalComments,
        commentsLastWeek,
        totalGlossaryTerms,
        totalPaths,
        totalBookmarks,
        totalLikes,
    ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'admin' }),
        User.countDocuments({ _id: { $gte: cutoffId } }),
        Article.countDocuments(),
        Article.countDocuments({ status: 'published' }),
        Article.countDocuments({ status: 'draft' }),
        Article.countDocuments({ featured: true }),
        Comment.countDocuments(),
        Comment.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
        GlossaryTerm.countDocuments(),
        LearningPath.countDocuments(),
        Bookmark.countDocuments(),
        Like.countDocuments(),
    ]);

    res.json({
        users: { total: totalUsers, admins: totalAdmins, lastWeek: usersLastWeek },
        articles: {
            total: totalArticles,
            published: publishedArticles,
            drafts: draftArticles,
            featured: featuredArticles,
        },
        comments: { total: totalComments, lastWeek: commentsLastWeek },
        glossary: { total: totalGlossaryTerms },
        paths: { total: totalPaths },
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
    const trimmed = String(search).trim();
    if (trimmed) {
        const safe = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        filter.$or = [
            { username: { $regex: safe, $options: 'i' } },
            { email: { $regex: safe, $options: 'i' } },
        ];
    }

    const [users, total] = await Promise.all([
        User.find(filter)
            .select('-password')
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
        { new: true, runValidators: true }
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

    await Promise.all([
        Article.deleteMany({ _ownerId: targetId }),
        Comment.deleteMany({ _ownerId: targetId }),
        Bookmark.deleteMany({ _ownerId: targetId }),
        Like.deleteMany({ _ownerId: targetId }),
        GlossaryTerm.deleteMany({ _ownerId: targetId }),
        LearningPath.deleteMany({ _ownerId: targetId }),
    ]);

    res.json({ message: 'User and all their content deleted.' });
});

export const adminListArticles = asyncHandler(async (req, res) => {
    const { search = '', page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page) || 1;
    const limitNum = Math.min(parseInt(limit) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const filter = {};
    const trimmed = String(search).trim();
    if (trimmed) {
        const safe = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
    res.json({ message: 'Comment deleted.' });
});
