import { describe, it, expect } from 'vitest';
import { isSessionValid } from '../utils/tokenExpiry';

describe('isSessionValid', () => {
    it('returns false when no expiry was stored', () => {
        expect(isSessionValid(undefined)).toBe(false);
        expect(isSessionValid(null)).toBe(false);
    });

    it('returns false for a non-finite expiry', () => {
        expect(isSessionValid(Number.NaN)).toBe(false);
        expect(isSessionValid(Number.POSITIVE_INFINITY)).toBe(false);
    });

    it('returns false for an expiry in the past', () => {
        expect(isSessionValid(Date.now() - 60_000)).toBe(false);
    });

    it('returns true for an expiry in the future', () => {
        expect(isSessionValid(Date.now() + 60 * 60_000)).toBe(true);
    });
});
