import Bookmark from '../models/Bookmark.js';

export const toggle = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "You must be logged in!" });
        }

        const { articleId } = req.body;
        const _ownerId = req.user._id;

        const existing = await Bookmark.findOneAndDelete({ articleId, _ownerId });

        if (existing) {
            return res.json({ bookmarked: false });
        }

        await Bookmark.create({ articleId, _ownerId });
        res.status(201).json({ bookmarked: true });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getMyBookmarks = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "You must be logged in!" });
        }

        const bookmarks = await Bookmark.find({ _ownerId: req.user._id })
            .populate('articleId')
            .sort({ createdAt: -1 });

        const articles = bookmarks
            .filter(b => b.articleId)
            .map(b => b.articleId);

        res.json(articles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};