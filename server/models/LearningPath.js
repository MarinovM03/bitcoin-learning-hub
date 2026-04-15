import mongoose from 'mongoose';

const learningPathSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minLength: 5,
        maxLength: 100,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        minLength: 10,
        maxLength: 300,
        trim: true,
    },
    difficulty: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        default: 'Beginner',
    },
    coverImage: {
        type: String,
        match: /^https?:\/\//,
        default: '',
    },
    articles: [{
        type: mongoose.Types.ObjectId,
        ref: 'Article',
    }],
    _ownerId: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });

learningPathSchema.index({ _ownerId: 1, createdAt: -1 });

const LearningPath = mongoose.model('LearningPath', learningPathSchema);

export default LearningPath;
