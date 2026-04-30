import { AppError } from '../utils/AppError.js';

export const requireAdmin = (req, _res, next) => {
    if (!req.user) {
        return next(new AppError(401, 'Authentication required.'));
    }
    if (req.user.role !== 'admin') {
        return next(new AppError(403, 'Admin access required.'));
    }
    next();
};
