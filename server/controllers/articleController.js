import Article from '../models/Article.js';

export const getAll = async (req, res) => {
    try {
        const articles = await Article.find();
        res.json(articles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const create = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "You must be logged in to post!" });
        }

        const newArticle = await Article.create({
            ...req.body,
            _ownerId: req.user._id
        });

        res.status(201).json(newArticle);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getOne = async (req, res) => {
    try {
        const articleId = req.params.articleId;
        const article = await Article.findById(articleId);

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
        const articleId = req.params.articleId;
        const article = await Article.findById(articleId);

        if (article._ownerId.toString() !== req.user._id) {
            return res.status(403).json({ message: "You are not authorized to edit this article" });
        }

        const updatedArticle = await Article.findByIdAndUpdate(articleId, req.body, { new: true });
        res.json(updatedArticle);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const remove = async (req, res) => {
    try {
        const articleId = req.params.articleId;
        const article = await Article.findById(articleId);

        if (article._ownerId.toString() !== req.user._id) {
            return res.status(403).json({ message: "You are not authorized to delete this article" });
        }

        await Article.findByIdAndDelete(articleId);
        res.json({ message: "Article deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};