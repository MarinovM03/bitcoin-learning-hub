import { visit, SKIP } from 'unist-util-visit';
import type { Root, Element, RootContent } from 'hast';

export interface GlossaryEntry {
    _id: string;
    term: string;
}

const SKIP_TAGS = new Set(['a', 'code', 'pre', 'kbd', 'samp', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']);
const MIN_TERM_LENGTH = 3;

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const link = (termId: string, text: string): Element => ({
    type: 'element',
    tagName: 'a',
    properties: { href: `/glossary/${termId}`, className: ['glossary-link'] },
    children: [{ type: 'text', value: text }],
});

interface Candidate {
    entry: GlossaryEntry;
    at: number;
    text: string;
}

const firstMatch = (value: string, entries: GlossaryEntry[], linked: Set<string>): Candidate | null => {
    let best: Candidate | null = null;

    for (const entry of entries) {
        if (linked.has(entry._id)) continue;

        const match = new RegExp(`\\b${escapeRegex(entry.term)}\\b`, 'i').exec(value);
        if (!match) continue;

        const candidate = { entry, at: match.index, text: match[0] };
        const earlier = best === null || candidate.at < best.at;
        const longerAtSamePlace = best !== null
            && candidate.at === best.at
            && candidate.text.length > best.text.length;

        if (earlier || longerAtSamePlace) best = candidate;
    }

    return best;
};

/**
 * Links the first mention of each glossary term and no others — a page where
 * every occurrence of "wallet" is a link reads like spam and buries the article.
 */
export const rehypeGlossaryLinks = (entries: GlossaryEntry[] = []) => {
    const usable = entries
        .filter(entry => entry?.term && entry.term.trim().length >= MIN_TERM_LENGTH)
        .sort((a, b) => b.term.length - a.term.length);

    return () => (tree: Root) => {
        if (usable.length === 0) return;

        const linked = new Set<string>();

        visit(tree, 'element', (node: Element) => {
            if (SKIP_TAGS.has(node.tagName)) return SKIP;

            const next: RootContent[] = [];
            let touched = false;

            for (const child of node.children) {
                if (child.type !== 'text') {
                    next.push(child);
                    continue;
                }

                let rest = child.value;
                let match = firstMatch(rest, usable, linked);

                if (!match) {
                    next.push(child);
                    continue;
                }

                touched = true;

                while (match) {
                    const before = rest.slice(0, match.at);
                    if (before) next.push({ type: 'text', value: before });

                    next.push(link(match.entry._id, match.text));
                    linked.add(match.entry._id);

                    rest = rest.slice(match.at + match.text.length);
                    match = firstMatch(rest, usable, linked);
                }

                if (rest) next.push({ type: 'text', value: rest });
            }

            if (touched) {
                node.children = next as Element['children'];
            }
        });
    };
};
