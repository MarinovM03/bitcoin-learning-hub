import Comment from '../models/Comment.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAccessibleArticle } from '../utils/articleAccess.js';

export const getAllForArticle = asyncHandler(async (req, res) => {
    const { articleId } = req.params;
    const comments = await Comment.find({ articleId })
        .populate('_ownerId', 'username profilePicture')
        .sort({ createdAt: -1 });
    res.json(comments);
});

export const create = asyncHandler(async (req, res) => {
    const { articleId, text } = req.body;

    await requireAccessibleArticle(articleId, req.user._id);

    const comment = await Comment.create({
        articleId,
        text,
        _ownerId: req.user._id,
    });

    const populated = await comment.populate('_ownerId', 'username profilePicture');

    res.status(201).json(populated);
});

const EDIT_WINDOW_MS = 5 * 60 * 1000;

export const update = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { text } = req.body;

    const updated = await Comment.findOneAndUpdate(
        {
            _id: commentId,
            _ownerId: req.user._id,
            createdAt: { $gte: new Date(Date.now() - EDIT_WINDOW_MS) },
        },
        { text },
        { returnDocument: 'after', runValidators: true },
    ).populate('_ownerId', 'username profilePicture');

    if (!updated) {
        const existing = await Comment.findById(commentId).select('_ownerId');
        if (!existing) throw new AppError(404, 'Comment not found');
        if (String(existing._ownerId) !== String(req.user._id)) {
            throw new AppError(403, 'Forbidden');
        }
        throw new AppError(400, 'Comments can only be edited within 5 minutes of posting.');
    }

    res.json(updated);
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
