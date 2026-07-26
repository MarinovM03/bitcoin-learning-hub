import mongoose from 'mongoose';

export const REPORT_TARGETS = ['article', 'comment', 'glossary'];
export const REPORT_REASONS = ['spam', 'scam', 'abuse', 'misinformation', 'other'];

const reportSchema = new mongoose.Schema({
    targetType: {
        type: String,
        enum: REPORT_TARGETS,
        required: true,
    },
    targetId: {
        type: mongoose.Types.ObjectId,
        required: true,
    },
    _reporterId: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    reason: {
        type: String,
        enum: REPORT_REASONS,
        required: true,
    },
    note: {
        type: String,
        default: '',
        trim: true,
        maxLength: 300,
    },
    status: {
        type: String,
        enum: ['open', 'resolved', 'dismissed'],
        default: 'open',
        index: true,
    },
}, { timestamps: true });

reportSchema.index({ _reporterId: 1, targetType: 1, targetId: 1 }, { unique: true });
reportSchema.index({ status: 1, createdAt: 1 });
reportSchema.index({ targetType: 1, targetId: 1 });

const Report = mongoose.model('Report', reportSchema);

export default Report;
