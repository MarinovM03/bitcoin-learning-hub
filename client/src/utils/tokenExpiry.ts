export const isSessionValid = (expiresAt: number | undefined | null): boolean => {
    if (typeof expiresAt !== 'number' || !Number.isFinite(expiresAt)) return false;
    return expiresAt > Date.now();
};
