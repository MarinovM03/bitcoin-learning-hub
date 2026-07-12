import { AppError } from '../utils/AppError.js';
import User from '../models/User.js';

export const requireAdmin = async (req, _res, next) => {
    if (!req.user) {
        return next(new AppError(401, 'Authentication required.'));
    }

    try {
        const user = await User.findById(req.user._id).select('role +tokenVersion').lean();
        const currentVersion = user?.tokenVersion ?? 0;
        const tokenVersion = req.user.tokenVersion ?? 0;
        if (!user || currentVersion !== tokenVersion) {
            return next(new AppError(401, 'Authentication required.'));
        }
        if (user.role !== 'admin') {
            return next(new AppError(403, 'Admin access required.'));
        }
        next();
    } catch (err) {
        next(err);
    }
};
