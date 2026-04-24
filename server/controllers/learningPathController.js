import mongoose from 'mongoose';
import LearningPath from '../models/LearningPath.js';
import ReadArticle from '../models/ReadArticle.js';
import Article from '../models/Article.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

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

export const getAll = asyncHandler(async (req, res) => {
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
});

export const getMyPaths = asyncHandler(async (req, res) => {
    const paths = await LearningPath.find({ _ownerId: req.user._id })
        .sort({ createdAt: -1 })
        .populate('articles', 'imageUrl title');
    res.json(paths);
});

export const getOne = asyncHandler(async (req, res) => {
    const { pathId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(pathId)) {
        throw new AppError(404, 'Path not found');
    }

    const path = await LearningPath.findById(pathId)
        .populate('_ownerId', 'username profilePicture')
        .populate({
            path: 'articles',
            select: 'title summary imageUrl category difficulty readingTime _ownerId status',
            populate: { path: '_ownerId', select: 'username' },
        });

    if (!path) throw new AppError(404, 'Path not found');

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
});

export const create = asyncHandler(async (req, res) => {
    const { title, description, difficulty, coverImage, articles } = req.body;

    const cleanArticles = sanitizeArticleIds(articles);
    if (cleanArticles.length > 0) {
        const count = await Article.countDocuments({
            _id: { $in: cleanArticles },
            status: 'published',
        });
        if (count !== cleanArticles.length) {
            throw new AppError(400, 'One or more articles do not exist or are not published.');
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
});

export const update = asyncHandler(async (req, res) => {
    const { pathId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(pathId)) {
        throw new AppError(404, 'Path not found');
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
                throw new AppError(400, 'One or more articles do not exist or are not published.');
            }
        }
        updateData.articles = cleanArticles;
    }

    const updated = await LearningPath.findOneAndUpdate(
        { _id: pathId, _ownerId: req.user._id },
        updateData,
        { new: true, runValidators: true }
    );

    if (!updated) throw new AppError(403, 'Forbidden');
    res.json(updated);
});

export const remove = asyncHandler(async (req, res) => {
    const { pathId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(pathId)) {
        throw new AppError(404, 'Path not found');
    }

    const deleted = await LearningPath.findOneAndDelete({
        _id: pathId,
        _ownerId: req.user._id,
    });

    if (!deleted) throw new AppError(403, 'Forbidden');
    res.json({ message: 'Path deleted successfully' });
});
