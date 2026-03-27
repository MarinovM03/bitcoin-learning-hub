import GlossaryTerm from '../models/GlossaryTerm.js';

export const getAll = async (req, res) => {
    try {
        const terms = await GlossaryTerm.find().sort({ term: 1 });
        res.json(terms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const create = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "You must be logged in!" });
        }

        const { term, definition, category } = req.body;

        const existing = await GlossaryTerm.findOne({ term: { $regex: new RegExp(`^${term}$`, 'i') } });
        if (existing) {
            return res.status(400).json({ message: "This term already exists in the glossary!" });
        }

        const newTerm = await GlossaryTerm.create({
            term,
            definition,
            category,
            _ownerId: req.user._id,
        });

        res.status(201).json(newTerm);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const remove = async (req, res) => {
    try {
        const { termId } = req.params;

        const term = await GlossaryTerm.findById(termId);

        if (!term) {
            return res.status(404).json({ message: "Term not found" });
        }

        if (String(term._ownerId) !== String(req.user._id)) {
            return res.status(403).json({ message: "Forbidden" });
        }

        await GlossaryTerm.findByIdAndDelete(termId);

        res.json({ message: "Term deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};