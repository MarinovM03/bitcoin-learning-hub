import GlossaryTerm from '../models/GlossaryTerm.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const CASE_INSENSITIVE = { locale: 'en', strength: 2 };

const sanitizeExamples = (value) => {
    if (!Array.isArray(value)) return [];
    return value
        .map((item) => (typeof item === 'string' ? item.trim() : ''))
        .filter(Boolean)
        .slice(0, 10);
};

export const getAll = asyncHandler(async (req, res) => {
    const terms = await GlossaryTerm.find()
        .collation(CASE_INSENSITIVE)
        .sort({ term: 1 });
    res.json(terms);
});

export const getOne = asyncHandler(async (req, res) => {
    const term = await GlossaryTerm.findById(req.params.termId).lean();
    if (!term) {
        throw new AppError(404, 'Term not found');
    }

    const neighborProjection = { term: 1 };
    const [prev, next, related] = await Promise.all([
        GlossaryTerm.findOne({ term: { $lt: term.term } }, neighborProjection)
            .collation(CASE_INSENSITIVE)
            .sort({ term: -1 })
            .lean(),
        GlossaryTerm.findOne({ term: { $gt: term.term } }, neighborProjection)
            .collation(CASE_INSENSITIVE)
            .sort({ term: 1 })
            .lean(),
        GlossaryTerm.find(
            { category: term.category, _id: { $ne: term._id } },
            { term: 1, definition: 1, category: 1 }
        )
            .collation(CASE_INSENSITIVE)
            .sort({ term: 1 })
            .limit(4)
            .lean(),
    ]);

    res.json({ ...term, prev, next, related });
});

export const create = asyncHandler(async (req, res) => {
    const { term, definition, category, extendedDefinition, examples } = req.body;

    const existing = await GlossaryTerm.findOne({ term: { $regex: new RegExp(`^${term}$`, 'i') } });
    if (existing) {
        throw new AppError(400, 'This term already exists in the glossary!');
    }

    const newTerm = await GlossaryTerm.create({
        term,
        definition,
        category,
        extendedDefinition: extendedDefinition?.trim() || '',
        examples: sanitizeExamples(examples),
        _ownerId: req.user._id,
    });

    res.status(201).json(newTerm);
});

export const remove = asyncHandler(async (req, res) => {
    const { termId } = req.params;

    const deleted = await GlossaryTerm.findOneAndDelete({
        _id: termId,
        _ownerId: req.user._id,
    });

    if (!deleted) {
        const exists = await GlossaryTerm.exists({ _id: termId });
        if (!exists) throw new AppError(404, 'Term not found');
        throw new AppError(403, 'Forbidden');
    }

    res.json({ message: 'Term deleted successfully' });
});
