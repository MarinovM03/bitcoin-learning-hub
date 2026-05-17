import { describe, it, expect } from 'vitest';
import { isTokenValid } from '../utils/tokenExpiry';

const makeToken = (payload: Record<string, unknown>) => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const body = btoa(JSON.stringify(payload));
    return `${header}.${body}.signature-placeholder`;
};

describe('isTokenValid', () => {
    it('returns false for an undefined or empty token', () => {
        expect(isTokenValid(undefined)).toBe(false);
        expect(isTokenValid(null)).toBe(false);
        expect(isTokenValid('')).toBe(false);
    });

    it('returns false for a token missing a payload segment', () => {
        expect(isTokenValid('only-one-segment')).toBe(false);
    });

    it('returns false for a token with non-decodable payload', () => {
        expect(isTokenValid('aaa.bbb.ccc')).toBe(false);
    });

    it('returns false for a token without an exp claim', () => {
        expect(isTokenValid(makeToken({ user: 'x' }))).toBe(false);
    });

    it('returns false for an expired token', () => {
        const past = Math.floor(Date.now() / 1000) - 60;
        expect(isTokenValid(makeToken({ exp: past }))).toBe(false);
    });

    it('returns true for a token whose exp is in the future', () => {
        const future = Math.floor(Date.now() / 1000) + 60 * 60;
        expect(isTokenValid(makeToken({ exp: future }))).toBe(true);
    });
});
