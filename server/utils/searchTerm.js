export const MAX_SEARCH_LENGTH = 100;

export const clampSearchTerm = (value) =>
    (typeof value === 'string' ? value : '').trim().slice(0, MAX_SEARCH_LENGTH);
