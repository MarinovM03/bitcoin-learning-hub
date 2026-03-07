import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
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
    ownerEmail: {
        type: String,
        required: true,
    },
    ownerProfilePicture: {
        type: String,
    },
    text: {
        type: String,
        required: true,
        minlength: [2, 'Comment must be at least 2 characters long'],
        maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;