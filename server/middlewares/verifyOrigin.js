import { AppError } from '../utils/AppError.js';
import { ACCESS_TOKEN_COOKIE } from '../utils/authCookies.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export const verifyOrigin = (allowedOrigins) => (req, _res, next) => {
    if (SAFE_METHODS.has(req.method)) return next();
    if (!req.cookies?.[ACCESS_TOKEN_COOKIE]) return next();

    const origin = req.headers.origin;
    if (origin && !allowedOrigins.includes(origin)) {
        return next(new AppError(403, 'Request blocked: unrecognised origin.'));
    }

    next();
};
