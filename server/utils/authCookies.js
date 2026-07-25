export const ACCESS_TOKEN_COOKIE = 'accessToken';
export const SESSION_MAX_AGE_MS = 2 * 24 * 60 * 60 * 1000;

const isProduction = () => process.env.NODE_ENV === 'production';

const cookieOptions = () => {
    const sameSite = (process.env.COOKIE_SAMESITE || 'lax').toLowerCase();
    const secure = process.env.COOKIE_SECURE
        ? process.env.COOKIE_SECURE === 'true'
        : isProduction() || sameSite === 'none';

    return {
        httpOnly: true,
        sameSite,
        secure,
        path: '/',
        ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
    };
};

export const setSessionCookie = (res, token) => {
    res.cookie(ACCESS_TOKEN_COOKIE, token, { ...cookieOptions(), maxAge: SESSION_MAX_AGE_MS });
};

export const clearSessionCookie = (res) => {
    res.clearCookie(ACCESS_TOKEN_COOKIE, cookieOptions());
};

export const sessionExpiresAt = () => Date.now() + SESSION_MAX_AGE_MS;
