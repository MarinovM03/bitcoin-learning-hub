import Article from '../models/Article.js';
import Like from '../models/Like.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

export const getAll = async (req, res) => {
    try {
        const { limit, sort, page, search, category } = req.query;

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

        const [articles, total] = await Promise.all([
            Article.find(filter).sort(sortOption).skip(skip).limit(limitNum),
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
        const { title, category, imageUrl, summary, content, status } = req.body;

        const newArticle = await Article.create({
            title,
            category,
            imageUrl,
            summary,
            content,
            status: status === 'draft' ? 'draft' : 'published',
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

        const article = await Article.findByIdAndUpdate(
            articleId,
            isOwner ? {} : { $inc: { views: 1 } },
            { new: true }
        ).populate('_ownerId', 'username profilePicture');

        res.json(article);
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
        const { title, category, imageUrl, summary, content, status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(articleId)) {
            return res.status(404).json({ message: "Article not found" });
        }

        const updateData = { title, category, imageUrl, summary, content };
        if (status === 'draft' || status === 'published') {
            updateData.status = status;
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