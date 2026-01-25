import Like from '../models/Like.js';

export const likeArticle = async (req, res) => {
    try {
        const { articleId } = req.body;
        const _ownerId = req.user._id;

        const existingLike = await Like.findOne({ articleId, _ownerId });

        if (existingLike) {
            return res.status(400).json({ message: "You already liked this article!" });
        }

        const like = await Like.create({ articleId, _ownerId });
        res.status(201).json(like);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getLikes = async (req, res) => {
    try {
        const articleId = req.params.articleId;
        const likes = await Like.find({ articleId });

        res.json(likes);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};