import mongoose from 'mongoose';
import LearningPath from '../models/LearningPath.js';
import ReadArticle from '../models/ReadArticle.js';
import Article from '../models/Article.js';

const sanitizeArticleIds = (input) => {
    if (!Array.isArray(input)) return [];
    const seen = new Set();
    const valid = [];
    for (const id of input) {
        if (!mongoose.Types.ObjectId.isValid(id)) continue;
        const str = String(id);
        if (seen.has(str)) continue;
        seen.add(str);
        valid.push(id);
    }
    return valid;
};

const computeProgress = async (userId, articleIds) => {
    if (!userId || !Array.isArray(articleIds) || articleIds.length === 0) {
        return { completed: 0, total: articleIds?.length || 0, completedIds: [] };
    }
    const reads = await ReadArticle.find({
        _ownerId: userId,
        articleId: { $in: articleIds },
    }).select('articleId');
    const completedIds = reads.map(r => String(r.articleId));
    return { completed: completedIds.length, total: articleIds.length, completedIds };
};

export const getAll = async (req, res) => {
    try {
        const { limit, page, difficulty } = req.query;
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 12;
        const skip = (pageNum - 1) * limitNum;

        const filter = {};
        if (difficulty && difficulty !== 'All') {
            filter.difficulty = difficulty;
        }

        const [paths, total] = await Promise.all([
            LearningPath.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .populate('_ownerId', 'username')
                .populate('articles', 'imageUrl title'),
            LearningPath.countDocuments(filter),
        ]);

        res.json({ paths, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMyPaths = async (req, res) => {
    try {
        const paths = await LearningPath.find({ _ownerId: req.user._id })
            .sort({ createdAt: -1 })
            .populate('articles', 'imageUrl title');
        res.json(paths);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getOne = async (req, res) => {
    try {
        const { pathId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(pathId)) {
            return res.status(404).json({ message: 'Path not found' });
        }

        const path = await LearningPath.findById(pathId)
            .populate('_ownerId', 'username profilePicture')
            .populate({
                path: 'articles',
                select: 'title summary imageUrl category difficulty readingTime _ownerId status',
                populate: { path: '_ownerId', select: 'username' },
            });

        if (!path) return res.status(404).json({ message: 'Path not found' });

        const articles = (path.articles || []).filter(a => a && a.status !== 'draft');
        const articleIds = articles.map(a => a._id);
        const progress = req.user
            ? await computeProgress(req.user._id, articleIds)
            : { completed: 0, total: articleIds.length, completedIds: [] };

        res.json({
            _id: path._id,
            title: path.title,
            description: path.description,
            difficulty: path.difficulty,
            coverImage: path.coverImage,
            articles,
            _ownerId: path._ownerId,
            createdAt: path.createdAt,
            updatedAt: path.updatedAt,
            progress,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const create = async (req, res) => {
    try {
        const { title, description, difficulty, coverImage, articles } = req.body;

        const cleanArticles = sanitizeArticleIds(articles);
        if (cleanArticles.length > 0) {
            const count = await Article.countDocuments({
                _id: { $in: cleanArticles },
                status: 'published',
            });
            if (count !== cleanArticles.length) {
                return res.status(400).json({ message: 'One or more articles do not exist or are not published.' });
            }
        }

        const newPath = await LearningPath.create({
            title,
            description,
            difficulty: difficulty || 'Beginner',
            coverImage: coverImage || '',
            articles: cleanArticles,
            _ownerId: req.user._id,
        });

        res.status(201).json(newPath);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const update = async (req, res) => {
    try {
        const { pathId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(pathId)) {
            return res.status(404).json({ message: 'Path not found' });
        }

        const { title, description, difficulty, coverImage, articles } = req.body;
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (difficulty !== undefined) updateData.difficulty = difficulty;
        if (coverImage !== undefined) updateData.coverImage = coverImage;

        if (articles !== undefined) {
            const cleanArticles = sanitizeArticleIds(articles);
            if (cleanArticles.length > 0) {
                const count = await Article.countDocuments({
                    _id: { $in: cleanArticles },
                    status: 'published',
                });
                if (count !== cleanArticles.length) {
                    return res.status(400).json({ message: 'One or more articles do not exist or are not published.' });
                }
            }
            updateData.articles = cleanArticles;
        }

        const updated = await LearningPath.findOneAndUpdate(
            { _id: pathId, _ownerId: req.user._id },
            updateData,
            { new: true, runValidators: true }
        );

        if (!updated) return res.status(403).json({ message: 'Forbidden' });
        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const remove = async (req, res) => {
    try {
        const { pathId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(pathId)) {
            return res.status(404).json({ message: 'Path not found' });
        }

        const deleted = await LearningPath.findOneAndDelete({
            _id: pathId,
            _ownerId: req.user._id,
        });

        if (!deleted) return res.status(403).json({ message: 'Forbidden' });
        res.json({ message: 'Path deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
