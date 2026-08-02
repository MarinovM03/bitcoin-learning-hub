import { AppError } from '../utils/AppError.js';
import { ACCESS_TOKEN_COOKIE } from '../utils/authCookies.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

const originOf = (url) => {
    try {
        return new URL(url).origin;
    } catch {
        return null;
    }
};

export const verifyOrigin = (allowedOrigins) => (req, _res, next) => {
    if (SAFE_METHODS.has(req.method)) return next();
    if (!req.cookies?.[ACCESS_TOKEN_COOKIE]) return next();

    const blocked = () => next(new AppError(403, 'Request blocked: unrecognised origin.'));

    if (req.headers['sec-fetch-site'] === 'cross-site') return blocked();

    const claimed = req.headers.origin ?? originOf(req.headers.referer ?? '');
    if (claimed && !allowedOrigins.includes(claimed)) return blocked();

    next();
};
