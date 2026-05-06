/**
 * Decodes the `exp` claim of a JWT and reports whether it is still valid.
 * Returns false on any parsing error so callers can safely treat the token as expired.
 *
 * Note: this is a non-cryptographic check intended only to avoid sending stale
 * tokens to the server. The server still verifies the signature on every request.
 */
export const isTokenValid = (token: string | undefined | null): boolean => {
    if (!token) return false;
    try {
        const [, payload] = token.split('.');
        if (!payload) return false;
        const decoded = JSON.parse(
            atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
        ) as { exp?: number };
        if (typeof decoded.exp !== 'number') return false;
        return decoded.exp * 1000 > Date.now();
    } catch {
        return false;
    }
};
