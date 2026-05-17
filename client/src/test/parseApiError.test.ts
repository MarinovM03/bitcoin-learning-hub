import { describe, it, expect } from 'vitest';
import { parseApiError } from '../utils/parseApiError';

describe('parseApiError', () => {
    it('returns the string when passed a string', () => {
        expect(parseApiError('boom')).toBe('boom');
    });

    it('returns the message field when present', () => {
        expect(parseApiError({ message: 'Custom message' })).toBe('Custom message');
    });

    it('translates fetch network errors to a friendly message', () => {
        expect(parseApiError({ message: 'Failed to fetch' })).toMatch(/Unable to connect/i);
    });

    it('falls back to a generic message when nothing useful is present', () => {
        expect(parseApiError({})).toMatch(/something went wrong/i);
        expect(parseApiError(null)).toMatch(/something went wrong/i);
        expect(parseApiError(undefined)).toMatch(/something went wrong/i);
        expect(parseApiError({ message: '' })).toMatch(/something went wrong/i);
    });
});
