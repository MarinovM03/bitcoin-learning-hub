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
    difficulty: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        default: 'Beginner',
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
    readingTime: {
        type: Number,
        default: 1,
    },
    views: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'published',
    },
    featured: {
        type: Boolean,
        default: false,
        index: true,
    },
    seriesName: {
        type: String,
        trim: true,
        maxLength: 80,
        default: '',
    },
    seriesPart: {
        type: Number,
        min: 1,
        max: 99,
        default: null,
    },
    quiz: [{
        question: { type: String, required: true },
        options: {
            type: [String],
            validate: { validator: v => v.length === 4, message: 'Each question must have exactly 4 options.' }
        },
        correctIndex: { type: Number, min: 0, max: 3, required: true },
    }],
    _ownerId: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
    },
}, { timestamps: true });

articleSchema.index(
    { title: 'text', summary: 'text', content: 'text' },
    { weights: { title: 10, summary: 5, content: 1 }, name: 'ArticleTextIndex' }
);

articleSchema.index(
    { _ownerId: 1, seriesName: 1, seriesPart: 1 },
    {
        unique: true,
        partialFilterExpression: {
            seriesName: { $type: 'string', $gt: '' },
            seriesPart: { $type: 'number' },
        },
        name: 'SeriesPartUnique',
    }
);

const Article = mongoose.model('Article', articleSchema);

export default Article;