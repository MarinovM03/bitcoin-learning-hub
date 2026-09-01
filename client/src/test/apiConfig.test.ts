import { describe, it, expect } from 'vitest';
import { API_BASE_URL } from '../lib/apiConfig';

describe('the configured API origin', () => {
    it('resolves to an absolute origin with no trailing slash', () => {
        expect(() => new URL(API_BASE_URL)).not.toThrow();
        expect(API_BASE_URL).toMatch(/^https?:\/\//);
        expect(API_BASE_URL.endsWith('/')).toBe(false);
    });

    it('builds request URLs that parse', () => {
        const target = `${API_BASE_URL}/articles?page=1`;
        const parsed = new URL(target);
        expect(parsed.pathname).toBe('/articles');
        expect(parsed.searchParams.get('page')).toBe('1');
    });
});
