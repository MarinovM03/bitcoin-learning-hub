import Article from '../models/Article.js';
import Like from '../models/Like.js';
import User from '../models/User.js';
import ReadArticle from '../models/ReadArticle.js';
import mongoose from 'mongoose';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const calculateReadingTime = (content) => {
    if (!content) return 1;
    const wordCount = content.trim().split(/\s+/).length;
    return Math.max(1, Math.round(wordCount / 200));
};

const normalizeSeriesInput = (seriesName, seriesPart) => {
    const name = typeof seriesName === 'string' ? seriesName.trim() : '';
    const partNum = Number.parseInt(seriesPart, 10);
    if (!name || !Number.isFinite(partNum) || partNum < 1) {
        return { seriesName: '', seriesPart: null };
    }
    return { seriesName: name, seriesPart: partNum };
};

const findDuplicateSeriesPart = async (ownerId, series, excludeArticleId = null) => {
    if (!series.seriesName || !series.seriesPart) return null;
    const query = {
        _ownerId: ownerId,
        seriesName: series.seriesName,
        seriesPart: series.seriesPart,
    };
    if (excludeArticleId) {
        query._id = { $ne: excludeArticleId };
    }
    return Article.findOne(query).select('_id title');
};

export const getAll = asyncHandler(async (req, res) => {
    const { limit, sort, page, search, category, difficulty } = req.query;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 12;
    const skip = (pageNum - 1) * limitNum;

    let sortOption = { createdAt: -1 };
    if (sort === 'views') sortOption = { views: -1 };

    const filter = { status: 'published' };

    if (search && search.trim() !== '') {
        filter.title = { $regex: search.trim(), $options: 'i' };
    }
    if (category && category !== 'All') {
        filter.category = category;
    }
    if (difficulty && difficulty !== 'All') {
        filter.difficulty = difficulty;
    }

    const [articles, total] = await Promise.all([
        Article.find(filter).sort(sortOption).skip(skip).limit(limitNum).populate('_ownerId', 'username'),
        Article.countDocuments(filter)
    ]);

    res.json({ articles, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
});

export const getMyArticles = asyncHandler(async (req, res) => {
    const articles = await Article.find({ _ownerId: req.user._id }).sort({ createdAt: -1 });
    res.json(articles);
});

export const create = asyncHandler(async (req, res) => {
    const { title, category, difficulty, imageUrl, summary, content, status, quiz, seriesName, seriesPart } = req.body;
    const series = normalizeSeriesInput(seriesName, seriesPart);

    const duplicate = await findDuplicateSeriesPart(req.user._id, series);
    if (duplicate) {
        throw new AppError(409, `Part ${series.seriesPart} already exists in "${series.seriesName}" ("${duplicate.title}"). Pick a different part number or edit the existing article.`);
    }

    const newArticle = await Article.create({
        title,
        category,
        difficulty: difficulty || 'Beginner',
        imageUrl,
        summary,
        content,
        readingTime: calculateReadingTime(content),
        status: status === 'draft' ? 'draft' : 'published',
        quiz: Array.isArray(quiz) ? quiz : [],
        seriesName: series.seriesName,
        seriesPart: series.seriesPart,
        _ownerId: req.user._id
    });

    res.status(201).json(newArticle);
});

export const getOne = asyncHandler(async (req, res) => {
    const { articleId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(articleId)) {
        throw new AppError(404, 'Article not found');
    }

    const existing = await Article.findById(articleId);
    if (!existing) {
        throw new AppError(404, 'Article not found');
    }

    const isOwner = req.user && String(req.user._id) === String(existing._ownerId);

    if (existing.status === 'draft' && !isOwner) {
        throw new AppError(404, 'Article not found');
    }

    const shouldIncrementView = !isOwner && !hasViewedRecently(req, articleId);

    const article = await Article.findByIdAndUpdate(
        articleId,
        shouldIncrementView ? { $inc: { views: 1 } } : {},
        { new: true }
    ).populate('_ownerId', 'username profilePicture');

    if (shouldIncrementView) {
        recordView(req, articleId);
    }

    let hasRead = false;
    if (req.user) {
        const readDoc = await ReadArticle.findOne({
            _ownerId: req.user._id,
            articleId,
        }).select('_id');
        hasRead = Boolean(readDoc);
    }

    res.json({ ...article.toObject(), hasRead });
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
    if (!article) {
        throw new AppError(404, 'Article not found');
    }

    const related = await Article.find({
        category: article.category,
        _id: { $ne: article._id },
        status: 'published',
    })
        .sort({ createdAt: -1 })
        .limit(3)
        .select('title summary imageUrl category _id');

    res.json(related);
});

export const getMySeriesParts = asyncHandler(async (req, res) => {
    const name = typeof req.query.name === 'string' ? req.query.name.trim() : '';
    if (!name) return res.json({ parts: [] });

    const excludeId = req.query.excludeId;
    const query = { _ownerId: req.user._id, seriesName: name, seriesPart: { $ne: null } };
    if (excludeId && mongoose.Types.ObjectId.isValid(excludeId)) {
        query._id = { $ne: excludeId };
    }

    const docs = await Article.find(query).select('seriesPart');
    const parts = docs.map(d => d.seriesPart).filter(Number.isFinite);
    res.json({ parts });
});

export const getSeries = asyncHandler(async (req, res) => {
    const { articleId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(articleId)) {
        throw new AppError(404, 'Article not found');
    }

    const current = await Article.findById(articleId).select('seriesName _ownerId');
    if (!current || !current.seriesName) {
        return res.json({ seriesName: '', parts: [] });
    }

    const parts = await Article.find({
        _ownerId: current._ownerId,
        seriesName: current.seriesName,
        status: 'published',
    })
        .sort({ seriesPart: 1, createdAt: 1 })
        .select('title seriesPart imageUrl category readingTime');

    res.json({ seriesName: current.seriesName, parts });
});

export const getPublicProfile = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new AppError(404, 'User not found');
    }

    const [user, articles] = await Promise.all([
        User.findById(userId).select('username profilePicture'),
        Article.find({ _ownerId: userId, status: 'published' }).sort({ createdAt: -1 })
    ]);

    if (!user) {
        throw new AppError(404, 'User not found');
    }

    const articleIds = articles.map(a => a._id);
    const totalLikes = articleIds.length > 0
        ? await Like.countDocuments({ articleId: { $in: articleIds } })
        : 0;

    res.json({ username: user.username, profilePicture: user.profilePicture, articles, totalLikes });
});

export const update = asyncHandler(async (req, res) => {
    const { articleId } = req.params;
    const { title, category, difficulty, imageUrl, summary, content, status, quiz, seriesName, seriesPart } = req.body;

    if (!mongoose.Types.ObjectId.isValid(articleId)) {
        throw new AppError(404, 'Article not found');
    }

    const updateData = { title, category, imageUrl, summary, content };
    if (content) updateData.readingTime = calculateReadingTime(content);
    if (difficulty) updateData.difficulty = difficulty;
    if (status === 'draft' || status === 'published') updateData.status = status;
    if (Array.isArray(quiz)) updateData.quiz = quiz;
    if (seriesName !== undefined || seriesPart !== undefined) {
        const series = normalizeSeriesInput(seriesName, seriesPart);
        updateData.seriesName = series.seriesName;
        updateData.seriesPart = series.seriesPart;

        const duplicate = await findDuplicateSeriesPart(req.user._id, series, articleId);
        if (duplicate) {
            throw new AppError(409, `Part ${series.seriesPart} already exists in "${series.seriesName}" ("${duplicate.title}"). Pick a different part number or edit the existing article.`);
        }
    }

    const updatedArticle = await Article.findOneAndUpdate(
        { _id: articleId, _ownerId: req.user._id },
        updateData,
        { new: true, runValidators: true }
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

    const deletedArticle = await Article.findOneAndDelete({
        _id: articleId,
        _ownerId: req.user._id
    });

    if (!deletedArticle) {
        throw new AppError(403, 'Forbidden');
    }

    res.json({ message: 'Article deleted successfully' });
});

export const getTrending = asyncHandler(async (req, res) => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const trending = await Like.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        { $group: { _id: '$articleId', likeCount: { $sum: 1 } } },
        { $sort: { likeCount: -1 } },
        { $limit: 3 },
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

const getViewerKey = (req, articleId) => {
    const viewer = req.user ? req.user._id : (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown');
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

const recordView = (req, articleId) => {
    const key = getViewerKey(req, articleId);
    recentViews.set(key, Date.now() + VIEW_TTL_MS);
};
