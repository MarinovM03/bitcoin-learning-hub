import Article from '../models/Article.js';
import Like from '../models/Like.js';
import User from '../models/User.js';
import ReadArticle from '../models/ReadArticle.js';
import mongoose from 'mongoose';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { escapeRegex } from '../utils/escapeRegex.js';
import { clampSearchTerm } from '../utils/searchTerm.js';
import { cascadeArticleDelete } from '../utils/cascadeArticles.js';
import { isArticleVisibleTo } from '../utils/articleAccess.js';
import { canPublishDirectly } from '../utils/trust.js';
import { uniqueSlug } from '../utils/slugify.js';

const calculateReadingTime = (content) => {
    if (!content) return 1;
    const wordCount = content.trim().split(/\s+/).length;
    return Math.max(1, Math.round(wordCount / 200));
};

const resolveSubmissionStatus = (requestedStatus, author) => {
    if (requestedStatus === 'draft') return 'draft';
    return canPublishDirectly(author) ? 'published' : 'pending';
};

export const getAll = asyncHandler(async (req, res) => {
    const pageNum = Math.max(parseInt(req.query.page) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(req.query.limit) || 12, 1), 50);
    const skip = (pageNum - 1) * limitNum;

    const sort = typeof req.query.sort === 'string' ? req.query.sort : '';
    const search = clampSearchTerm(req.query.search);
    const category = typeof req.query.category === 'string' ? req.query.category : '';
    const difficulty = typeof req.query.difficulty === 'string' ? req.query.difficulty : '';

    let sortOption = { createdAt: -1 };
    if (sort === 'views') sortOption = { views: -1 };

    const filter = { status: 'published' };

    if (search) {
        const safe = escapeRegex(search);
        filter.title = { $regex: safe, $options: 'i' };
    }
    if (category && category !== 'All') {
        filter.category = category;
    }
    if (difficulty && difficulty !== 'All') {
        filter.difficulty = difficulty;
    }

    const [articles, total] = await Promise.all([
        Article.find(filter)
            .select('-content -quiz')
            .sort(sortOption)
            .skip(skip)
            .limit(limitNum)
            .populate('_ownerId', 'username'),
        Article.countDocuments(filter)
    ]);

    res.json({ articles, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
});

export const getMyArticles = asyncHandler(async (req, res) => {
    const articles = await Article.find({ _ownerId: req.user._id })
        .select('-content -quiz')
        .sort({ createdAt: -1 });
    res.json(articles);
});

export const create = asyncHandler(async (req, res) => {
    const { title, category, difficulty, imageUrl, summary, content, status, quiz } = req.body;

    const newArticle = await Article.create({
        title,
        slug: await uniqueSlug(Article, title, null, 'article'),
        category,
        difficulty: difficulty || 'Beginner',
        imageUrl,
        summary,
        content,
        readingTime: calculateReadingTime(content),
        status: resolveSubmissionStatus(status, req.authUser),
        quiz: Array.isArray(quiz) ? quiz : [],
        _ownerId: req.user._id
    });

    res.status(201).json(newArticle);
});

export const getOne = asyncHandler(async (req, res) => {
    const { articleId: ref } = req.params;

    const lookup = mongoose.Types.ObjectId.isValid(ref)
        ? { _id: ref }
        : { $or: [{ slug: ref }, { previousSlugs: ref }] };

    const article = await Article.findOne(lookup).populate('_ownerId', 'username profilePicture');
    if (!isArticleVisibleTo(article, req.user?._id)) {
        throw new AppError(404, 'Article not found');
    }

    const articleId = article._id;

    const ownerId = article._ownerId?._id ?? article._ownerId;
    const isOwner = req.user && String(req.user._id) === String(ownerId);

    if (!isOwner && !hasViewedRecently(req, articleId)) {
        article.views = (article.views || 0) + 1;
        recordView(req, articleId);
        
        Article.updateOne({ _id: articleId }, { $inc: { views: 1 } }).catch(() => {});
    }

    let hasRead = false;
    if (req.user) {
        const readDoc = await ReadArticle.findOne({
            _ownerId: req.user._id,
            articleId,
        }).select('_id');
        hasRead = Boolean(readDoc);
    }

    const payload = { ...article.toObject(), hasRead };
    if (!isOwner) {
        payload.quiz = (payload.quiz || []).map(({ question, options }) => ({ question, options }));
    }

    res.json(payload);
});

export const checkQuizAnswer = asyncHandler(async (req, res) => {
    const { articleId } = req.params;
    const { questionIndex, answerIndex } = req.body;

    const article = await Article.findById(articleId).select('status quiz _ownerId');
    if (!isArticleVisibleTo(article, req.user?._id)) {
        throw new AppError(404, 'Article not found');
    }

    const question = article.quiz?.[questionIndex];
    if (!question) {
        throw new AppError(404, 'Question not found');
    }

    res.json({
        isCorrect: question.correctIndex === answerIndex,
        correctIndex: question.correctIndex,
    });
});

export const markRead = asyncHandler(async (req, res) => {
    const { articleId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(articleId)) {
        throw new AppError(404, 'Article not found');
    }

    const article = await Article.findById(articleId).select('status');
    if (!article || article.status !== 'published') {
        throw new AppError(404, 'Article not found');
    }

    await ReadArticle.updateOne(
        { _ownerId: req.user._id, articleId },
        { $setOnInsert: { _ownerId: req.user._id, articleId } },
        { upsert: true }
    );

    res.json({ read: true });
});

export const markUnread = asyncHandler(async (req, res) => {
    const { articleId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(articleId)) {
        throw new AppError(404, 'Article not found');
    }

    await ReadArticle.deleteOne({ _ownerId: req.user._id, articleId });
    res.json({ read: false });
});

export const getReadHistory = asyncHandler(async (req, res) => {
    const entries = await ReadArticle.find({ _ownerId: req.user._id })
        .populate('articleId', 'title slug category imageUrl summary difficulty readingTime views status createdAt')
        .sort({ createdAt: -1 })
        .limit(60)
        .lean();

    const articles = entries
        .filter(entry => entry.articleId?.status === 'published')
        .map(entry => ({ ...entry.articleId, readAt: entry.createdAt }));

    res.json(articles);
});

export const resetReadHistory = asyncHandler(async (req, res) => {
    const result = await ReadArticle.deleteMany({ _ownerId: req.user._id });
    res.json({ cleared: result.deletedCount || 0 });
});

export const getRelated = asyncHandler(async (req, res) => {
    const { articleId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(articleId)) {
        throw new AppError(404, 'Article not found');
    }

    const article = await Article.findById(articleId);
    if (!isArticleVisibleTo(article, req.user?._id)) {
        throw new AppError(404, 'Article not found');
    }

    const related = await Article.find({
        category: article.category,
        _id: { $ne: article._id },
        status: 'published',
    })
        .sort({ createdAt: -1 })
        .limit(3)
        .select('title slug summary imageUrl category _id');

    res.json(related);
});

export const getPublicProfile = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new AppError(404, 'User not found');
    }

    const [user, articles] = await Promise.all([
        User.findById(userId).select('username profilePicture createdAt'),
        Article.find({ _ownerId: userId, status: 'published' })
            .select('-content -quiz')
            .sort({ createdAt: -1 })
    ]);

    if (!user) {
        throw new AppError(404, 'User not found');
    }

    const articleIds = articles.map(a => a._id);
    const totalLikes = articleIds.length > 0
        ? await Like.countDocuments({ articleId: { $in: articleIds } })
        : 0;

    res.json({
        username: user.username,
        profilePicture: user.profilePicture,
        joinedAt: user.createdAt ?? user._id.getTimestamp(),
        articles,
        totalLikes,
    });
});

export const update = asyncHandler(async (req, res) => {
    const { articleId } = req.params;
    const { title, category, difficulty, imageUrl, summary, content, status, quiz } = req.body;

    if (!mongoose.Types.ObjectId.isValid(articleId)) {
        throw new AppError(404, 'Article not found');
    }

    const updateData = {};
    if (category !== undefined) updateData.category = category;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (summary !== undefined) updateData.summary = summary;
    if (content !== undefined) {
        updateData.content = content;
        updateData.readingTime = calculateReadingTime(content);
    }
    if (difficulty) updateData.difficulty = difficulty;
    if (Array.isArray(quiz)) updateData.quiz = quiz;

    const existing = await Article.findOne({ _id: articleId, _ownerId: req.user._id })
        .select('status title slug previousSlugs');
    if (!existing) {
        throw new AppError(403, 'Forbidden');
    }

    if (title !== undefined) {
        updateData.title = title;

        if (title !== existing.title) {
            updateData.slug = await uniqueSlug(Article, title, articleId, 'article');

            if (updateData.slug !== existing.slug) {
                updateData.previousSlugs = [
                    ...existing.previousSlugs.filter(s => s !== updateData.slug),
                    existing.slug,
                ].slice(-20);
            }
        }
    }

    if (canPublishDirectly(req.authUser)) {
        if (status === 'draft' || status === 'published') updateData.status = status;
    } else if (status === 'draft') {
        updateData.status = 'draft';
    } else if (status === 'published' || existing.status !== 'draft') {
        updateData.status = 'pending';
        updateData.moderationNote = '';
        updateData.featured = false;
    }

    const updatedArticle = await Article.findOneAndUpdate(
        { _id: articleId, _ownerId: req.user._id },
        updateData,
        { returnDocument: 'after', runValidators: true }
    );

    if (!updatedArticle) {
        throw new AppError(403, 'Forbidden');
    }

    res.json(updatedArticle);
});

export const remove = asyncHandler(async (req, res) => {
    const { articleId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(articleId)) {
        throw new AppError(404, 'Article not found');
    }

    const article = await Article.findOne({
        _id: articleId,
        _ownerId: req.user._id
    }).select('_id');

    if (!article) {
        throw new AppError(403, 'Forbidden');
    }

    await cascadeArticleDelete(articleId);
    await Article.deleteOne({ _id: articleId });

    res.json({ message: 'Article deleted successfully' });
});

export const getTrending = asyncHandler(async (req, res) => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const trending = await Like.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        { $group: { _id: '$articleId', likeCount: { $sum: 1 } } },
        { $sort: { likeCount: -1 } },
        {
            $lookup: {
                from: 'articles',
                localField: '_id',
                foreignField: '_id',
                as: 'article'
            }
        },
        { $unwind: '$article' },
        { $match: { 'article.status': 'published' } },
        { $limit: 3 },
        {
            $project: {
                _id: '$article._id',
                title: '$article.title',
                summary: '$article.summary',
                imageUrl: '$article.imageUrl',
                category: '$article.category',
                likeCount: 1,
            }
        }
    ]);

    res.json(trending);
});

const recentViews = new Map();
const VIEW_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_TRACKED_VIEWS = 50_000;

const getViewerKey = (req, articleId) => {
    const viewer = req.user ? req.user._id : (req.ip || 'unknown');
    return `${viewer}:${articleId}`;
};

const hasViewedRecently = (req, articleId) => {
    const key = getViewerKey(req, articleId);
    const expiry = recentViews.get(key);
    if (!expiry) return false;
    if (Date.now() > expiry) {
        recentViews.delete(key);
        return false;
    }
    return true;
};

const pruneExpiredViews = (now) => {
    for (const [key, expiry] of recentViews) {
        if (now > expiry) recentViews.delete(key);
    }
};

const recordView = (req, articleId) => {
    const key = getViewerKey(req, articleId);
    const now = Date.now();
    if (recentViews.size >= MAX_TRACKED_VIEWS) {
        pruneExpiredViews(now);
        if (recentViews.size >= MAX_TRACKED_VIEWS) {
            const oldestKey = recentViews.keys().next().value;
            recentViews.delete(oldestKey);
        }
    }
    recentViews.set(key, now + VIEW_TTL_MS);
};
