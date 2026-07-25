import { AppError } from '../utils/AppError.js';

export const requireVerified = (req, _res, next) => {
    if (!req.authUser?.emailVerified) {
        return next(new AppError(403, 'Confirm your email address before publishing. Check your inbox for the confirmation link.'));
    }
    next();
};
