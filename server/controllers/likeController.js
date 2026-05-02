import Like from '../models/Like.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const toggleLike = asyncHandler(async (req, res) => {
    const { articleId } = req.body;
    const _ownerId = req.user._id;

    const existing = await Like.findOneAndDelete({ articleId, _ownerId });

    if (existing) {
        const totalLikes = await Like.countDocuments({ articleId });
        return res.json({ liked: false, totalLikes });
    }

    try {
        await Like.create({ articleId, _ownerId });
    } catch (err) {
        if (err?.code !== 11000) throw err;
    }

    const totalLikes = await Like.countDocuments({ articleId });
    res.status(201).json({ liked: true, totalLikes });
});

export const getLikes = asyncHandler(async (req, res) => {
    const { articleId } = req.params;
    const likes = await Like.find({ articleId });
    res.json(likes);
});
