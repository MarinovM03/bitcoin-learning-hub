const DEFAULT_TRUST_THRESHOLD = 5;

const parseThreshold = (value) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : DEFAULT_TRUST_THRESHOLD;
};

export const trustThreshold = () => parseThreshold(process.env.TRUST_THRESHOLD);

export const isAdmin = (user) => user?.role === 'admin';

export const canPublishDirectly = (user) =>
    isAdmin(user) || user?.isTrusted === true;

export const hasEarnedTrust = (approvedArticles) =>
    (approvedArticles ?? 0) >= trustThreshold();
