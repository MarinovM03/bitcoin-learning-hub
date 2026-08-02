import { AppError } from '../utils/AppError.js';
import User from '../models/User.js';
import { isSessionRevoked } from '../utils/sessionRevocation.js';

export const requireAuth = async (req, _res, next) => {
    if (!req.user) {
        return next(new AppError(401, 'Authentication required.'));
    }

    try {
        const user = await User.findById(req.user._id)
            .select('role emailVerified +tokenVersion +isTrusted +revokedSessions')
            .lean();
        const currentVersion = user?.tokenVersion ?? 0;
        const tokenVersion = req.user.tokenVersion ?? 0;
        if (!user || currentVersion !== tokenVersion || isSessionRevoked(user, req.user.sid)) {
            return next(new AppError(401, 'Authentication required.'));
        }
        req.authUser = user;
        next();
    } catch (err) {
        next(err);
    }
};
