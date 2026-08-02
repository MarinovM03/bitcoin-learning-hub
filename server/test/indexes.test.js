import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import Comment from '../models/Comment.js';
import Bookmark from '../models/Bookmark.js';
import Like from '../models/Like.js';
import ReadArticle from '../models/ReadArticle.js';

const planFor = async (query) => {
    const explained = await query.explain('queryPlanner');
    return JSON.stringify(explained.queryPlanner ?? explained);
};

const expectIndexed = (plan) => {
    expect(plan).toContain('IXSCAN');
    expect(plan).not.toContain('COLLSCAN');
};

const anId = () => new mongoose.Types.ObjectId();

describe('hot-path queries run on an index', () => {
    it('loads an article thread without scanning every comment', async () => {
        const plan = await planFor(
            Comment.find({ articleId: anId() }).sort({ createdAt: -1 }),
        );
        expectIndexed(plan);
    });

    it('loads a reader\'s bookmarks without scanning every bookmark', async () => {
        const plan = await planFor(
            Bookmark.find({ _ownerId: anId() }).sort({ createdAt: -1 }),
        );
        expectIndexed(plan);
    });

    it('narrows trending likes by date without scanning every like', async () => {
        const plan = await planFor(
            Like.find({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
        );
        expectIndexed(plan);
    });

    it('clears read state for a deleted article without a full scan', async () => {
        const plan = await planFor(ReadArticle.find({ articleId: { $in: [anId()] } }));
        expectIndexed(plan);
    });
});
