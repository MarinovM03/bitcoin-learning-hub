import Bookmark from '../models/Bookmark.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const toggle = asyncHandler(async (req, res) => {
    const { articleId } = req.body;
    const _ownerId = req.user._id;

    const existing = await Bookmark.findOneAndDelete({ articleId, _ownerId });

    if (existing) {
        return res.json({ bookmarked: false });
    }

    await Bookmark.create({ articleId, _ownerId });
    res.status(201).json({ bookmarked: true });
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
