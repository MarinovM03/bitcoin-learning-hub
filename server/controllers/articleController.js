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
        const { title, category, imageUrl, summary, content } = req.body;

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
        const articleId = req.params.articleId;

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