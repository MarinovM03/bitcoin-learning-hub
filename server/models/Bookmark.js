import mongoose from 'mongoose';

const bookmarkSchema = new mongoose.Schema({
    articleId: {
        type: mongoose.Types.ObjectId,
        ref: 'Article',
        required: true,
    },
    _ownerId: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

bookmarkSchema.index({ articleId: 1, _ownerId: 1 }, { unique: true });

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);

export default Bookmark;