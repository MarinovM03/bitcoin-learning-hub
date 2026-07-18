import { describe, it, expect } from 'vitest';
import { extractHeadings } from '../utils/markdownToc';

describe('extractHeadings', () => {
    it('extracts headings with depth and github-style slugs', () => {
        const md = '# Intro\n\nSome text.\n\n## The Genesis Block\n\nMore.\n\n### Why It Matters';
        expect(extractHeadings(md)).toEqual([
            { depth: 1, text: 'Intro', slug: 'intro' },
            { depth: 2, text: 'The Genesis Block', slug: 'the-genesis-block' },
            { depth: 3, text: 'Why It Matters', slug: 'why-it-matters' },
        ]);
    });

    it('ignores headings inside fenced code blocks', () => {
        const md = '## Real\n\n```\n# not a heading\n```\n\n## Also Real';
        expect(extractHeadings(md).map(h => h.text)).toEqual(['Real', 'Also Real']);
    });

    it('strips inline markdown from heading text', () => {
        const md = '## The **Bold** and [Linked](https://example.com) `Code` Part';
        expect(extractHeadings(md)[0]).toEqual({
            depth: 2,
            text: 'The Bold and Linked Code Part',
            slug: 'the-bold-and-linked-code-part',
        });
    });

    it('deduplicates identical headings with numeric suffixes', () => {
        const md = '## Setup\n\n## Setup';
        expect(extractHeadings(md).map(h => h.slug)).toEqual(['setup', 'setup-1']);
    });

    it('skips headings deeper than the max depth', () => {
        const md = '## Kept\n\n#### Skipped';
        expect(extractHeadings(md).map(h => h.text)).toEqual(['Kept']);
    });

    it('returns an empty list for empty content', () => {
        expect(extractHeadings(undefined)).toEqual([]);
        expect(extractHeadings('No headings here at all.')).toEqual([]);
    });
});
