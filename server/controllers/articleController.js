import Article from '../models/Article.js';
import mongoose from 'mongoose';

export const getAll = async (req, res) => {
    try {
        const { limit, sort } = req.query;

        let query = Article.find();

        if (sort === 'latest') {
            query = query.sort({ createdAt: -1 });
        }

        if (limit) {
            query = query.limit(parseInt(limit));
        }

        const articles = await query;
        res.json(articles);
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
        const { title, category, imageUrl, summary, content } = req.body;

        const newArticle = await Article.create({
            title,
            category,
            imageUrl,
            summary,
            content,
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

        const article = await Article.findByIdAndUpdate(
            articleId,
            { $inc: { views: 1 } },
            { new: true }
        ).populate('_ownerId', 'username profilePicture');

        if (!article) {
            return res.status(404).json({ message: "Article not found" });
        }

        res.json(article);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const update = async (req, res) => {
    try {
        const { articleId } = req.params;
        const { title, category, imageUrl, summary, content } = req.body;

        if (!mongoose.Types.ObjectId.isValid(articleId)) {
            return res.status(404).json({ message: "Article not found" });
        }

        const updatedArticle = await Article.findOneAndUpdate(
            { _id: articleId, _ownerId: req.user._id },
            { title, category, imageUrl, summary, content },
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