import Comment from '../models/Comment.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getAllForArticle = asyncHandler(async (req, res) => {
    const { articleId } = req.params;
    const comments = await Comment.find({ articleId })
        .populate('_ownerId', 'username profilePicture')
        .sort({ createdAt: -1 });
    res.json(comments);
});

export const create = asyncHandler(async (req, res) => {
    const { articleId, text } = req.body;

    if (!text || text.trim().length < 2) {
        throw new AppError(400, 'Comment must be at least 2 characters long!');
    }

    const comment = await Comment.create({
        articleId,
        text: text.trim(),
        _ownerId: req.user._id,
        ownerUsername: req.user.username,
        ownerProfilePicture: req.user.profilePicture || '',
    });

    const populated = await comment.populate('_ownerId', 'username profilePicture');

    res.status(201).json(populated);
});

export const remove = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    const deleted = await Comment.findOneAndDelete({
        _id: commentId,
        _ownerId: req.user._id,
    });

    if (!deleted) {
        const exists = await Comment.exists({ _id: commentId });
        if (!exists) throw new AppError(404, 'Comment not found');
        throw new AppError(403, 'Forbidden');
    }

    res.json({ message: 'Comment deleted successfully' });
});
