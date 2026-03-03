import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema({
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
});

likeSchema.index({ articleId: 1, _ownerId: 1 }, { unique: true });

const Like = mongoose.model('Like', likeSchema);

export default Like;