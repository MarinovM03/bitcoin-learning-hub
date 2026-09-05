import Article from '../models/Article.js';
import GlossaryTerm from '../models/GlossaryTerm.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { clientBaseUrl } from '../utils/authEmails.js';
import { escapeXml } from '../utils/escapeXml.js';

const CACHE_TTL_MS = 60 * 60 * 1000;
let cache = { xml: null, generatedAt: 0 };

export const resetSitemapCache = () => {
    cache = { xml: null, generatedAt: 0 };
};

const STATIC_ROUTES = [
    { path: '', changefreq: 'daily', priority: '1.0' },
    { path: '/articles', changefreq: 'daily', priority: '0.9' },
    { path: '/glossary', changefreq: 'weekly', priority: '0.8' },
    { path: '/dca', changefreq: 'monthly', priority: '0.6' },
    { path: '/address', changefreq: 'monthly', priority: '0.6' },
    { path: '/multisig', changefreq: 'monthly', priority: '0.6' },
    { path: '/converter', changefreq: 'monthly', priority: '0.6' },
];

const urlEntry =({ loc, lastmod, changefreq, priority }) => [
    '  <url>',
    `    <loc>${escapeXml(loc)}</loc>`,
    lastmod ? `    <lastmod>${new Date(lastmod).toISOString().split('T')[0]}</lastmod>` : null,
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : null,
    priority ? `    <priority>${priority}</priority>` : null,
    '  </url>',
].filter(Boolean).join('\n');

export const getSitemap = asyncHandler(async (_req, res) => {
    const now = Date.now();
    if (cache.xml && now - cache.generatedAt < CACHE_TTL_MS) {
        res.type('application/xml').send(cache.xml);
        return;
    }

    const base = clientBaseUrl();
    const [articles, terms] = await Promise.all([
        Article.find({ status: 'published' }).select('updatedAt').sort({ updatedAt: -1 }).lean(),
        GlossaryTerm.find({ status: 'published' }).select('updatedAt').sort({ updatedAt: -1 }).lean(),
    ]);

    const entries = [
        ...STATIC_ROUTES.map((route) => ({
            loc: `${base}${route.path}`,
            changefreq: route.changefreq,
            priority: route.priority,
        })),
        ...articles.map((article) => ({
            loc: `${base}/articles/${article._id}/details`,
            lastmod: article.updatedAt,
            changefreq: 'weekly',
            priority: '0.8',
        })),
        ...terms.map((term) => ({
            loc: `${base}/glossary/${term._id}`,
            lastmod: term.updatedAt,
            changefreq: 'monthly',
            priority: '0.6',
        })),
    ];

    const xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...entries.map(urlEntry),
        '</urlset>',
    ].join('\n');

    cache = { xml, generatedAt: now };
    res.type('application/xml').send(xml);
});
