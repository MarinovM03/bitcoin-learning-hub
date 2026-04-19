import mongoose from 'mongoose';

const pathCertificationSchema = new mongoose.Schema({
    _ownerId: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    pathId: {
        type: mongoose.Types.ObjectId,
        ref: 'LearningPath',
        required: true,
    },
    score: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
    },
    correctAnswers: {
        type: Number,
        required: true,
        min: 0,
    },
    totalQuestions: {
        type: Number,
        required: true,
        min: 1,
    },
    passedAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
}, { timestamps: true });

pathCertificationSchema.index({ _ownerId: 1, pathId: 1 }, { unique: true });
pathCertificationSchema.index({ _ownerId: 1, passedAt: -1 });

const PathCertification = mongoose.model('PathCertification', pathCertificationSchema);

export default PathCertification;
