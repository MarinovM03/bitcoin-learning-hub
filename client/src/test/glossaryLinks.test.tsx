import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import MarkdownContent from '../components/markdown-content/MarkdownContent';

const glossary = [
    { _id: 'term-utxo', term: 'UTXO' },
    { _id: 'term-mempool', term: 'mempool' },
    { _id: 'term-pow', term: 'Proof of Work' },
    { _id: 'term-work', term: 'Work' },
];

const renderMarkdown = (content: string) =>
    render(
        <MemoryRouter>
            <MarkdownContent content={content} glossary={glossary} />
        </MemoryRouter>,
    );

const glossaryLinks = (container: HTMLElement) =>
    [...container.querySelectorAll('a.glossary-link')];

describe('linking glossary terms inside an article', () => {
    it('links a term the first time it appears', () => {
        const { container } = renderMarkdown('A UTXO is a chunk of bitcoin.');
        const links = glossaryLinks(container);

        expect(links).toHaveLength(1);
        expect(links[0]?.getAttribute('href')).toBe('/glossary/term-utxo');
        expect(links[0]?.textContent).toBe('UTXO');
    });

    it('links each term once, however often it recurs', () => {
        const { container } = renderMarkdown(
            'A UTXO is spent whole.\n\nAnother UTXO follows.\n\nAnd a third UTXO after that.',
        );
        expect(glossaryLinks(container)).toHaveLength(1);
    });

    it('links different terms independently', () => {
        const { container } = renderMarkdown('A UTXO waits in the mempool.');
        const hrefs = glossaryLinks(container).map(a => a.getAttribute('href'));

        expect(hrefs).toContain('/glossary/term-utxo');
        expect(hrefs).toContain('/glossary/term-mempool');
    });

    it('prefers the longest matching term', () => {
        const { container } = renderMarkdown('Miners perform Proof of Work to find a block.');
        const links = glossaryLinks(container);

        expect(links).toHaveLength(1);
        expect(links[0]?.textContent).toBe('Proof of Work');
    });

    it('matches regardless of case, keeping the author wording', () => {
        const { container } = renderMarkdown('The utxo set grows over time.');
        expect(glossaryLinks(container)[0]?.textContent).toBe('utxo');
    });

    it('leaves headings alone', () => {
        const { container } = renderMarkdown('## What is a UTXO\n\nPlain text here.');
        expect(container.querySelector('h2 a')).toBeNull();
    });

    it('leaves code alone', () => {
        const { container } = renderMarkdown('Run `mempool --help` to begin.');
        expect(container.querySelector('code a')).toBeNull();
    });

    it('does not nest a link inside an existing link', () => {
        const { container } = renderMarkdown('[read about the mempool](/articles/something)');
        expect(container.querySelector('a a')).toBeNull();
        expect(glossaryLinks(container)).toHaveLength(0);
    });

    it('does not match a term buried inside a longer word', () => {
        const { container } = renderMarkdown('Networking is not about the mempoolish.');
        expect(glossaryLinks(container)).toHaveLength(0);
    });

    it('renders untouched when no glossary is supplied', () => {
        const { container } = render(
            <MemoryRouter>
                <MarkdownContent content="A UTXO is a chunk of bitcoin." />
            </MemoryRouter>,
        );
        expect(glossaryLinks(container)).toHaveLength(0);
    });
});
