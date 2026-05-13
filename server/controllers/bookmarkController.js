import Bookmark from '../models/Bookmark.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const toggle = asyncHandler(async (req, res) => {
    const { articleId } = req.body;
    const _ownerId = req.user._id;

    const deleted = await Bookmark.findOneAndDelete({ articleId, _ownerId });
    if (deleted) {
        return res.json({ bookmarked: false });
    }

    try {
        await Bookmark.create({ articleId, _ownerId });
        return res.status(201).json({ bookmarked: true });
    } catch (err) {
        if (err?.code === 11000) {
            return res.json({ bookmarked: true });
        }
        throw err;
    }
});

export const getMyBookmarks = asyncHandler(async (req, res) => {
    const bookmarks = await Bookmark.find({ _ownerId: req.user._id })
        .populate('articleId')
        .sort({ createdAt: -1 });

    const articles = bookmarks
        .filter(b => b.articleId)
        .map(b => b.articleId);

    res.json(articles);
});
