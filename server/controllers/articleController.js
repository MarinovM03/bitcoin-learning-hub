import Article from '../models/Article.js';
import Like from '../models/Like.js';
import User from '../models/User.js';
import ReadArticle from '../models/ReadArticle.js';
import mongoose from 'mongoose';

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

export const getAll = async (req, res) => {
    try {
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
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMyArticles = async (req, res) => {
    try {
        const articles = await Article.find({ _ownerId: req.user._id }).sort({ createdAt: -1 });
        res.json(articles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const create = async (req, res) => {
    try {
        const { title, category, difficulty, imageUrl, summary, content, status, quiz, seriesName, seriesPart } = req.body;
        const series = normalizeSeriesInput(seriesName, seriesPart);

        const duplicate = await findDuplicateSeriesPart(req.user._id, series);
        if (duplicate) {
            return res.status(409).json({
                message: `Part ${series.seriesPart} already exists in "${series.seriesName}" ("${duplicate.title}"). Pick a different part number or edit the existing article.`
            });
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
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getOne = async (req, res) => {
    try {
        const { articleId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(articleId)) {
            return res.status(404).json({ message: "Article not found" });
        }

        const existing = await Article.findById(articleId);
        if (!existing) {
            return res.status(404).json({ message: "Article not found" });
        }

        const isOwner = req.user && String(req.user._id) === String(existing._ownerId);

        if (existing.status === 'draft' && !isOwner) {
            return res.status(404).json({ message: "Article not found" });
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

        res.json(article);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const markRead = async (req, res) => {
    try {
        const { articleId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(articleId)) {
            return res.status(404).json({ message: 'Article not found' });
        }

        const article = await Article.findById(articleId).select('status');
        if (!article || article.status !== 'published') {
            return res.status(404).json({ message: 'Article not found' });
        }

        await ReadArticle.updateOne(
            { _ownerId: req.user._id, articleId },
            { $setOnInsert: { _ownerId: req.user._id, articleId } },
            { upsert: true }
        );

        res.json({ read: true });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const markUnread = async (req, res) => {
    try {
        const { articleId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(articleId)) {
            return res.status(404).json({ message: 'Article not found' });
        }

        await ReadArticle.deleteOne({ _ownerId: req.user._id, articleId });
        res.json({ read: false });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getRelated = async (req, res) => {
    try {
        const { articleId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(articleId)) {
            return res.status(404).json({ message: "Article not found" });
        }

        const article = await Article.findById(articleId);
        if (!article) {
            return res.status(404).json({ message: "Article not found" });
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
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMySeriesParts = async (req, res) => {
    try {
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
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getSeries = async (req, res) => {
    try {
        const { articleId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(articleId)) {
            return res.status(404).json({ message: "Article not found" });
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
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getPublicProfile = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(404).json({ message: "User not found" });
        }

        const [user, articles] = await Promise.all([
            User.findById(userId).select('username profilePicture'),
            Article.find({ _ownerId: userId, status: 'published' }).sort({ createdAt: -1 })
        ]);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const articleIds = articles.map(a => a._id);
        const totalLikes = articleIds.length > 0
            ? await Like.countDocuments({ articleId: { $in: articleIds } })
            : 0;

        res.json({ username: user.username, profilePicture: user.profilePicture, articles, totalLikes });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const update = async (req, res) => {
    try {
        const { articleId } = req.params;
        const { title, category, difficulty, imageUrl, summary, content, status, quiz, seriesName, seriesPart } = req.body;

        if (!mongoose.Types.ObjectId.isValid(articleId)) {
            return res.status(404).json({ message: "Article not found" });
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
                return res.status(409).json({
                    message: `Part ${series.seriesPart} already exists in "${series.seriesName}" ("${duplicate.title}"). Pick a different part number or edit the existing article.`
                });
            }
        }

        const updatedArticle = await Article.findOneAndUpdate(
            { _id: articleId, _ownerId: req.user._id },
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedArticle) {
            return res.status(403).json({ message: "Forbidden" });
        }

        res.json(updatedArticle);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const remove = async (req, res) => {
    try {
        const { articleId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(articleId)) {
            return res.status(404).json({ message: "Article not found" });
        }

        const deletedArticle = await Article.findOneAndDelete({
            _id: articleId,
            _ownerId: req.user._id
        });

        if (!deletedArticle) {
            return res.status(403).json({ message: "Forbidden" });
        }

        res.json({ message: "Article deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getTrending = async (req, res) => {
    try {
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
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

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