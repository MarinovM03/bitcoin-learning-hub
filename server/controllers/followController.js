import mongoose from 'mongoose';
import Follow from '../models/Follow.js';
import User from '../models/User.js';
import Article from '../models/Article.js';
import Collection from '../models/Collection.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const TARGET_MODELS = {
    user: User,
    collection: Collection,
};

const FEED_CARD_FIELDS = 'title summary imageUrl category difficulty readingTime views createdAt _ownerId';

export const toggle = asyncHandler(async (req, res) => {
    const { targetType, targetId } = req.body;

    if (targetType === 'user' && String(targetId) === String(req.user._id)) {
        throw new AppError(400, 'You cannot follow yourself.');
    }

    const target = await TARGET_MODELS[targetType].exists({ _id: targetId });
    if (!target) {
        throw new AppError(404, 'That account or collection no longer exists.');
    }

    const key = { _followerId: req.user._id, targetType, targetId };

    const existing = await Follow.findOneAndDelete(key);
    if (existing) {
        const followers = await Follow.countDocuments({ targetType, targetId });
        return res.json({ following: false, followers });
    }

    try {
        await Follow.create(key);
    } catch (err) {
        if (err?.code !== 11000) throw err;
    }

    const followers = await Follow.countDocuments({ targetType, targetId });
    res.status(201).json({ following: true, followers });
});

export const getSummary = asyncHandler(async (req, res) => {
    const { targetType, targetId } = req.params;

    const [followers, followedByMe] = await Promise.all([
        Follow.countDocuments({ targetType, targetId }),
        req.user
            ? Follow.exists({ _followerId: req.user._id, targetType, targetId })
            : Promise.resolve(null),
    ]);

    const following = targetType === 'user'
        ? await Follow.countDocuments({ _followerId: targetId, targetType: 'user' })
        : 0;

    res.json({ followers, following, followedByMe: Boolean(followedByMe) });
});

export const getFollowing = asyncHandler(async (req, res) => {
    const follows = await Follow.find({ _followerId: req.user._id }).sort({ createdAt: -1 }).lean();

    const userIds = follows.filter(f => f.targetType === 'user').map(f => f.targetId);
    const collectionIds = follows.filter(f => f.targetType === 'collection').map(f => f.targetId);

    const [users, collections] = await Promise.all([
        userIds.length > 0
            ? User.find({ _id: { $in: userIds } }).select('username profilePicture').lean()
            : [],
        collectionIds.length > 0
            ? Collection.find({ _id: { $in: collectionIds } })
                .select('title slug coverImage articles')
                .populate('_ownerId', 'username')
                .lean()
            : [],
    ]);

    const rank = new Map(follows.map((f, index) => [String(f.targetId), index]));
    const byFollowedAt = (a, b) => rank.get(String(a._id)) - rank.get(String(b._id));

    res.json({
        users: users.sort(byFollowedAt),
        collections: collections
            .map(({ articles, ...rest }) => ({ ...rest, articleCount: articles?.length ?? 0 }))
            .sort(byFollowedAt),
    });
});

export const getFeed = asyncHandler(async (req, res) => {
    const pageNum = Math.max(parseInt(req.query.page) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(req.query.limit) || 12, 1), 50);
    const skip = (pageNum - 1) * limitNum;

    const author = mongoose.Types.ObjectId.isValid(req.query.author) ? String(req.query.author) : null;

    const follows = await Follow.find({ _followerId: req.user._id }).lean();
    const following = follows.length;

    const authorIds = follows.filter(f => f.targetType === 'user').map(f => f.targetId);
    const collectionIds = follows.filter(f => f.targetType === 'collection').map(f => f.targetId);

    const emptyPage = { articles: [], total: 0, page: pageNum, totalPages: 0, following };

    if (author && !authorIds.some(id => String(id) === author)) {
        return res.json(emptyPage);
    }

    const followedCollections = !author && collectionIds.length > 0
        ? await Collection.find({ _id: { $in: collectionIds } }).select('articles').lean()
        : [];
    const collectedArticleIds = followedCollections.flatMap(c => c.articles ?? []);

    if (!author && authorIds.length === 0 && collectedArticleIds.length === 0) {
        return res.json(emptyPage);
    }

    const filter = author
        ? { status: 'published', _ownerId: author }
        : {
            status: 'published',
            $or: [
                { _ownerId: { $in: authorIds } },
                { _id: { $in: collectedArticleIds } },
            ],
        };

    const [articles, total] = await Promise.all([
        Article.find(filter)
            .select(FEED_CARD_FIELDS)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .populate('_ownerId', 'username profilePicture'),
        Article.countDocuments(filter),
    ]);

    res.json({
        articles,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
        following,
    });
});
