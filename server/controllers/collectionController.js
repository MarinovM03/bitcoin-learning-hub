import mongoose from 'mongoose';
import Collection from '../models/Collection.js';
import Article from '../models/Article.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uniqueSlug } from '../utils/slugify.js';

const CARD_FIELDS = 'title summary imageUrl category difficulty readingTime views status _ownerId';

const ownedArticleIds = async (ids, ownerId) => {
    if (!Array.isArray(ids) || ids.length === 0) return [];

    const owned = await Article.find({ _id: { $in: ids }, _ownerId: ownerId }).select('_id').lean();
    const allowed = new Set(owned.map(a => String(a._id)));

    const seen = new Set();
    return ids
        .map(String)
        .filter(id => allowed.has(id) && !seen.has(id) && seen.add(id) !== undefined);
};

const visibleArticles = (collection, viewerId) => {
    const isOwner = viewerId && String(collection._ownerId?._id ?? collection._ownerId) === String(viewerId);
    return (collection.articles ?? []).filter(
        article => article && (article.status === 'published' || isOwner),
    );
};

export const getAll = asyncHandler(async (req, res) => {
    const filter = {};
    const { author } = req.query;
    if (typeof author === 'string' && mongoose.Types.ObjectId.isValid(author)) {
        filter._ownerId = author;
    }

    const collections = await Collection.find(filter)
        .sort({ createdAt: -1 })
        .populate('_ownerId', 'username profilePicture')
        .populate({ path: 'articles', select: 'status imageUrl' })
        .lean();

    const summaries = collections
        .map(collection => {
            const published = (collection.articles ?? []).filter(a => a?.status === 'published');
            return {
                _id: collection._id,
                title: collection.title,
                slug: collection.slug,
                description: collection.description,
                coverImage: collection.coverImage || published[0]?.imageUrl || '',
                articleCount: published.length,
                _ownerId: collection._ownerId,
                createdAt: collection.createdAt,
            };
        })
        .filter(collection => collection.articleCount > 0);

    res.json(summaries);
});

export const getMine = asyncHandler(async (req, res) => {
    const collections = await Collection.find({ _ownerId: req.user._id })
        .sort({ createdAt: -1 })
        .populate({ path: 'articles', select: 'title status' })
        .lean();

    res.json(collections);
});

export const getOne = asyncHandler(async (req, res) => {
    const { slug } = req.params;

    const collection = await Collection.findOne({ $or: [{ slug }, { previousSlugs: slug }] })
        .populate('_ownerId', 'username profilePicture')
        .populate({
            path: 'articles',
            select: CARD_FIELDS,
            populate: { path: '_ownerId', select: 'username' },
        })
        .lean();

    if (!collection) {
        throw new AppError(404, 'Collection not found');
    }

    res.json({ ...collection, articles: visibleArticles(collection, req.user?._id) });
});

export const getForArticle = asyncHandler(async (req, res) => {
    const { articleId } = req.params;

    const collections = await Collection.find({ articles: articleId })
        .populate({ path: 'articles', select: 'title status' })
        .lean();

    const memberships = collections.map(collection => {
        const parts = visibleArticles(collection, req.user?._id);
        const position = parts.findIndex(a => String(a._id) === String(articleId));

        return {
            _id: collection._id,
            title: collection.title,
            slug: collection.slug,
            total: parts.length,
            position: position + 1,
            parts: parts.map(({ _id, title }) => ({ _id, title })),
            prev: position > 0 ? parts[position - 1] : null,
            next: position >= 0 && position < parts.length - 1 ? parts[position + 1] : null,
        };
    }).filter(membership => membership.position > 0);

    res.json(memberships);
});

export const create = asyncHandler(async (req, res) => {
    const { title, description, coverImage, articles } = req.body;

    const collection = await Collection.create({
        title,
        slug: await uniqueSlug(Collection, title),
        description: description?.trim() || '',
        coverImage: coverImage?.trim() || '',
        articles: await ownedArticleIds(articles, req.user._id),
        _ownerId: req.user._id,
    });

    res.status(201).json(collection);
});

export const update = asyncHandler(async (req, res) => {
    const { collectionId } = req.params;
    const { title, description, coverImage, articles } = req.body;

    const existing = await Collection.findOne({ _id: collectionId, _ownerId: req.user._id });
    if (!existing) {
        throw new AppError(403, 'Forbidden');
    }

    const updateData = {};
    if (description !== undefined) updateData.description = description.trim();
    if (coverImage !== undefined) updateData.coverImage = coverImage.trim();
    if (articles !== undefined) updateData.articles = await ownedArticleIds(articles, req.user._id);
    if (title !== undefined && title !== existing.title) {
        updateData.title = title;
        updateData.slug = await uniqueSlug(Collection, title, collectionId);

        if (updateData.slug !== existing.slug) {
            updateData.previousSlugs = [
                ...existing.previousSlugs.filter(s => s !== updateData.slug),
                existing.slug,
            ].slice(-20);
        }
    }

    const updated = await Collection.findOneAndUpdate(
        { _id: collectionId, _ownerId: req.user._id },
        updateData,
        { returnDocument: 'after', runValidators: true },
    );

    if (!updated) {
        throw new AppError(403, 'Forbidden');
    }

    res.json(updated);
});

export const remove = asyncHandler(async (req, res) => {
    const { collectionId } = req.params;

    const deleted = await Collection.findOneAndDelete({
        _id: collectionId,
        _ownerId: req.user._id,
    });

    if (!deleted) {
        const exists = await Collection.exists({ _id: collectionId });
        if (!exists) throw new AppError(404, 'Collection not found');
        throw new AppError(403, 'Forbidden');
    }

    res.json({ message: 'Collection deleted successfully' });
});
