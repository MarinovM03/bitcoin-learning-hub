import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import type { ReactNode } from 'react';
import MarkdownContent from '../components/markdown-content/MarkdownContent';

const routed = (node: ReactNode) => render(<MemoryRouter>{node}</MemoryRouter>);

describe('MarkdownContent', () => {
    it('returns null when content is empty', () => {
        const { container } = render(<MarkdownContent content="" />);
        expect(container.firstChild).toBeNull();
    });

    it('renders markdown headings as HTML', () => {
        const { container } = render(<MarkdownContent content="# Hello\n\nA paragraph." />);
        expect(container.querySelector('h1')).not.toBeNull();
    });

    it('gives headings prefixed anchor ids', () => {
        const { container } = render(<MarkdownContent content={'## The Genesis Block'} />);
        const heading = container.querySelector('h2');
        expect(heading?.getAttribute('id')).toBe('user-content-the-genesis-block');
    });

    it('strips <script> tags from user content', () => {
        const malicious = 'Hi there <script>window.__pwned = true</script> end.';
        const { container } = render(<MarkdownContent content={malicious} />);
        expect(container.querySelector('script')).toBeNull();
        expect((window as unknown as { __pwned?: boolean }).__pwned).toBeUndefined();
    });

    it('strips inline event handlers on tags', () => {
        const malicious = '<img src="x" onerror="window.__pwned = true" />';
        const { container } = render(<MarkdownContent content={malicious} />);
        const img = container.querySelector('img');
        if (img) expect(img.getAttribute('onerror')).toBeNull();
        expect((window as unknown as { __pwned?: boolean }).__pwned).toBeUndefined();
    });

    it('keeps a link to another page inside the app', () => {
        const { container } = routed(<MarkdownContent content="[the explainer](/tx)" />);
        const link = container.querySelector('a');
        expect(link?.getAttribute('href')).toBe('/tx');
        expect(link?.getAttribute('target')).toBeNull();
    });

    it('opens an outside link in a new tab without leaking the referrer', () => {
        const { container } = routed(<MarkdownContent content="[mempool](https://mempool.space)" />);
        const link = container.querySelector('a');
        expect(link?.getAttribute('target')).toBe('_blank');
        expect(link?.getAttribute('rel')).toContain('noopener');
    });

    it('leaves an in-page anchor alone', () => {
        const { container } = routed(<MarkdownContent content="[jump](#a-heading)" />);
        const link = container.querySelector('a');
        expect(link?.getAttribute('href')).toBe('#a-heading');
        expect(link?.getAttribute('target')).toBeNull();
    });
});
