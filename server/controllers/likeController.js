import Like from '../models/Like.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const likeArticle = asyncHandler(async (req, res) => {
    const { articleId } = req.body;
    const _ownerId = req.user._id;

    const existingLike = await Like.findOne({ articleId, _ownerId });

    if (existingLike) {
        throw new AppError(400, 'You already liked this article!');
    }

    const like = await Like.create({ articleId, _ownerId });
    res.status(201).json(like);
});

export const getLikes = asyncHandler(async (req, res) => {
    const { articleId } = req.params;
    const likes = await Like.find({ articleId });
    res.json(likes);
});
