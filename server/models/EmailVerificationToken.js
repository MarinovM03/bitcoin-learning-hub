import mongoose from 'mongoose';

const emailVerificationTokenSchema = new mongoose.Schema({
    _ownerId: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    tokenHash: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
}, { timestamps: true });

emailVerificationTokenSchema.index({ tokenHash: 1 });
emailVerificationTokenSchema.index({ _ownerId: 1 });
emailVerificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const EmailVerificationToken = mongoose.model('EmailVerificationToken', emailVerificationTokenSchema);

export default EmailVerificationToken;
