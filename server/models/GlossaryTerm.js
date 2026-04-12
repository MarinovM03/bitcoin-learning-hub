import mongoose from 'mongoose';

const glossaryTermSchema = new mongoose.Schema({
    term: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    definition: {
        type: String,
        required: true,
        minlength: 10,
    },
    category: {
        type: String,
        enum: ['Technology', 'Economics', 'Trading', 'Culture', 'Security'],
        required: true,
    },
    _ownerId: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

glossaryTermSchema.index(
    { term: 'text', definition: 'text' },
    { weights: { term: 10, definition: 2 }, name: 'GlossaryTextIndex' }
);

const GlossaryTerm = mongoose.model('GlossaryTerm', glossaryTermSchema);

export default GlossaryTerm;