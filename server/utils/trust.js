export const TRUST_THRESHOLD = 5;

export const isAdmin = (user) => user?.role === 'admin';

export const canPublishDirectly = (user) =>
    isAdmin(user) || user?.isTrusted === true;

export const hasEarnedTrust = (approvedArticles) =>
    (approvedArticles ?? 0) >= TRUST_THRESHOLD;
