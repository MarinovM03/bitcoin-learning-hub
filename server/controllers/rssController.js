import Article from '../models/Article.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { clientBaseUrl } from '../utils/authEmails.js';
import { escapeXml } from '../utils/escapeXml.js';

const CACHE_TTL_MS = 60 * 60 * 1000;
const FEED_LIMIT = 20;

let cache = { xml: null, generatedAt: 0 };

export const resetRssCache = () => {
    cache = { xml: null, generatedAt: 0 };
};

const item = (article, base) => {
    const url = `${base}/articles/${article._id}/details`;
    return [
        '    <item>',
        `      <title>${escapeXml(article.title)}</title>`,
        `      <link>${escapeXml(url)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
        `      <pubDate>${new Date(article.createdAt).toUTCString()}</pubDate>`,
        `      <description>${escapeXml(article.summary)}</description>`,
        article.category ? `      <category>${escapeXml(article.category)}</category>` : null,
        '    </item>',
    ].filter(Boolean).join('\n');
};

export const getRssFeed = asyncHandler(async (_req, res) => {
    const now = Date.now();
    if (cache.xml && now - cache.generatedAt < CACHE_TTL_MS) {
        res.type('application/rss+xml').send(cache.xml);
        return;
    }

    const base = clientBaseUrl();
    const articles = await Article.find({ status: 'published' })
        .select('title summary category createdAt')
        .sort({ createdAt: -1 })
        .limit(FEED_LIMIT)
        .lean();

    const xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
        '  <channel>',
        '    <title>Bitcoin Learning Hub</title>',
        `    <link>${escapeXml(base)}</link>`,
        '    <description>Community-driven Bitcoin education — articles, glossary, and live market tools.</description>',
        '    <language>en</language>',
        `    <atom:link href="${escapeXml(`${base}/rss.xml`)}" rel="self" type="application/rss+xml" />`,
        ...articles.map((article) => item(article, base)),
        '  </channel>',
        '</rss>',
    ].join('\n');

    cache = { xml, generatedAt: now };
    res.type('application/rss+xml').send(xml);
});
