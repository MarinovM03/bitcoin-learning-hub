import mongoose from 'mongoose';

export const FOLLOW_TARGETS = ['user', 'collection'];

const followSchema = new mongoose.Schema({
    _followerId: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    targetType: {
        type: String,
        enum: FOLLOW_TARGETS,
        required: true,
    },
    targetId: {
        type: mongoose.Types.ObjectId,
        required: true,
    },
}, { timestamps: true });

followSchema.index({ _followerId: 1, targetType: 1, targetId: 1 }, { unique: true });

followSchema.index({ targetType: 1, targetId: 1 });

const Follow = mongoose.model('Follow', followSchema);

export default Follow;
