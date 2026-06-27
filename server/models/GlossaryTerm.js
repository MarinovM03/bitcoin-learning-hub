import mongoose from 'mongoose';

const glossaryTermSchema = new mongoose.Schema({
    term: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        maxlength: 60,
    },
    definition: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 600,
    },
    extendedDefinition: {
        type: String,
        default: '',
        trim: true,
        maxlength: 2000,
    },
    examples: {
        type: [String],
        default: [],
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
}, { timestamps: true });

glossaryTermSchema.index(
    { term: 'text', definition: 'text' },
    { weights: { term: 10, definition: 2 }, name: 'GlossaryTextIndex' }
);

const GlossaryTerm = mongoose.model('GlossaryTerm', glossaryTermSchema);

export default GlossaryTerm;