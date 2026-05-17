import { AppError } from '../utils/AppError.js';
import User from '../models/User.js';

export const requireAdmin = async (req, _res, next) => {
    if (!req.user) {
        return next(new AppError(401, 'Authentication required.'));
    }

    try {
        const user = await User.findById(req.user._id).select('role').lean();
        if (!user || user.role !== 'admin') {
            return next(new AppError(403, 'Admin access required.'));
        }
        next();
    } catch (err) {
        next(err);
    }
};
