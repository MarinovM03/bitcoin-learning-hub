import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minLength: 5,
    },
    category: {
        type: String,
        required: true,
        enum: ['Basics', 'Technology', 'Economics', 'Security', 'History', 'Trading', 'Mining', 'Regulation', 'Culture'],
    },
    imageUrl: {
        type: String,
        required: true,
        match: /^https?:\/\//,
    },
    summary: {
        type: String,
        required: true,
        maxLength: 250,
    },
    content: {
        type: String,
        required: true,
    },
    views: {
        type: Number,
        default: 0,
    },
    _ownerId: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const Article = mongoose.model('Article', articleSchema);

export default Article;