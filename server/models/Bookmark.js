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
}, { timestamps: true });

bookmarkSchema.index({ articleId: 1, _ownerId: 1 }, { unique: true });

bookmarkSchema.index({ _ownerId: 1, createdAt: -1 });

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);

export default Bookmark;