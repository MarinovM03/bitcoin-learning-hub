import mongoose from 'mongoose';

const readArticleSchema = new mongoose.Schema({
    _ownerId: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    articleId: {
        type: mongoose.Types.ObjectId,
        ref: 'Article',
        required: true,
    },
}, { timestamps: true });

readArticleSchema.index({ _ownerId: 1, articleId: 1 }, { unique: true });

const ReadArticle = mongoose.model('ReadArticle', readArticleSchema);

export default ReadArticle;
