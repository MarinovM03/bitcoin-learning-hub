import GithubSlugger from 'github-slugger';

export interface TocHeading {
    depth: number;
    text: string;
    slug: string;
}

const stripInlineMarkdown = (raw: string): string =>
    raw
        .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
        .replace(/`([^`]*)`/g, '$1')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/__([^_]+)__/g, '$1')
        .replace(/_([^_]+)_/g, '$1')
        .trim();

export function extractHeadings(markdown: string | undefined | null, maxDepth = 3): TocHeading[] {
    if (!markdown) return [];

    const slugger = new GithubSlugger();
    const headings: TocHeading[] = [];
    let inFence = false;

    for (const line of markdown.split('\n')) {
        if (/^\s*(```|~~~)/.test(line)) {
            inFence = !inFence;
            continue;
        }
        if (inFence) continue;

        const match = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
        if (!match) continue;

        const depth = match[1]!.length;
        if (depth > maxDepth) continue;

        const text = stripInlineMarkdown(match[2]!);
        if (!text) continue;

        headings.push({ depth, text, slug: slugger.slug(text) });
    }

    return headings;
}
