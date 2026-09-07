import mongoose from 'mongoose';

const collectionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: [3, 'Title must be at least 3 characters long'],
        maxlength: [80, 'Title cannot exceed 80 characters'],
    },
    slug: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    previousSlugs: {
        type: [String],
        default: [],
    },
    description: {
        type: String,
        default: '',
        trim: true,
        maxlength: [300, 'Description cannot exceed 300 characters'],
    },
    coverImage: {
        type: String,
        default: '',
        validate: {
            validator: v => !v || /^https?:\/\//.test(v),
            message: 'Cover image must be a valid URL.',
        },
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

collectionSchema.index({ slug: 1 }, { unique: true });

collectionSchema.index({ _ownerId: 1, createdAt: -1 });

collectionSchema.index({ articles: 1 });

collectionSchema.index({ previousSlugs: 1 });

const Collection = mongoose.model('Collection', collectionSchema);

export default Collection;
