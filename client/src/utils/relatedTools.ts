import { TOOLS } from './navTools';
import type { NavTool } from './navTools';

const MAX_TOOLS = 3;

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const mentions = (haystack: string, keyword: string): boolean =>
    new RegExp(`\\b${escapeRegex(keyword)}\\b`, 'i').test(haystack);

/**
 * Scores on the title far above the body so a passing mention in one paragraph
 * never outranks a tool the article is actually about.
 */
export const relatedTools = (title?: string, content?: string): NavTool[] => {
    const heading = title ?? '';
    const body = content ?? '';
    if (!heading && !body) return [];

    return TOOLS
        .map(tool => {
            const score = tool.keywords.reduce((total, keyword) => {
                if (mentions(heading, keyword)) return total + 5;
                if (mentions(body, keyword)) return total + 1;
                return total;
            }, 0);
            return { tool, score };
        })
        .filter(entry => entry.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_TOOLS)
        .map(entry => entry.tool);
};
