import Comment from '../models/Comment.js';

export const getAllForArticle = async (req, res) => {
    try {
        const { articleId } = req.params;
        const comments = await Comment.find({ articleId }).sort({ createdAt: -1 });
        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const create = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "You must be logged in to comment!" });
        }

        const { articleId, text } = req.body;

        if (!text || text.trim().length < 2) {
            return res.status(400).json({ message: "Comment must be at least 2 characters long!" });
        }

        const comment = await Comment.create({
            articleId,
            text: text.trim(),
            _ownerId: req.user._id,
            ownerUsername: req.user.username,
            ownerProfilePicture: req.user.profilePicture || '',
        });

        res.status(201).json(comment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const remove = async (req, res) => {
    try {
        const { commentId } = req.params;

        const deleted = await Comment.findOneAndDelete({
            _id: commentId,
            _ownerId: req.user._id,
        });

        if (!deleted) {
            return res.status(403).json({ message: "Forbidden" });
        }

        res.json({ message: "Comment deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};