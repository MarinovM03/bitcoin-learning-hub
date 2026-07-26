import Report from '../models/Report.js';
import Article from '../models/Article.js';
import Comment from '../models/Comment.js';
import GlossaryTerm from '../models/GlossaryTerm.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const TARGET_MODELS = {
    article: Article,
    comment: Comment,
    glossary: GlossaryTerm,
};

export const create = asyncHandler(async (req, res) => {
    const { targetType, targetId, reason, note } = req.body;

    const target = await TARGET_MODELS[targetType].findById(targetId).select('_ownerId');
    if (!target) {
        throw new AppError(404, 'That content no longer exists.');
    }
    if (String(target._ownerId) === String(req.user._id)) {
        throw new AppError(400, 'You cannot report your own content.');
    }

    try {
        await Report.create({
            targetType,
            targetId,
            reason,
            note: note || '',
            _reporterId: req.user._id,
        });
    } catch (err) {
        if (err?.code === 11000) {
            return res.status(200).json({ message: 'You have already reported this. Thanks — a moderator will take a look.' });
        }
        throw err;
    }

    res.status(201).json({ message: 'Thanks for flagging this. A moderator will take a look.' });
});
