import Article from '../models/Article.js';
import GlossaryTerm from '../models/GlossaryTerm.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { escapeRegex } from '../utils/escapeRegex.js';

const ALLOWED_CATEGORIES = new Set([
    'Basics', 'Technology', 'Economics', 'Security', 'History', 'Trading', 'Mining', 'Regulation', 'Culture',
]);
const ALLOWED_DIFFICULTIES = new Set(['Beginner', 'Intermediate', 'Advanced']);
const READ_TIME_BUCKETS = {
    short: { $lte: 5 },
    medium: { $gt: 5, $lte: 15 },
    long: { $gt: 15 },
};

const extractSnippet = (text, query, maxLen = 180) => {
    if (!text || !query) return '';
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const matchAt = lowerText.indexOf(lowerQuery);
    if (matchAt === -1) return '';

    const queryLen = query.length;
    const contextRoom = Math.max(0, maxLen - queryLen);
    const half = Math.floor(contextRoom / 2);
    let start = Math.max(0, matchAt - half);
    let end = Math.min(text.length, matchAt + queryLen + half);

    if (start > 0) {
        const space = text.lastIndexOf(' ', start);
        if (space !== -1 && start - space < 25) start = space + 1;
    }
    if (end < text.length) {
        const space = text.indexOf(' ', end);
        if (space !== -1 && space - end < 25) end = space;
    }

    let snippet = text.slice(start, end).trim();
    if (start > 0) snippet = '… ' + snippet;
    if (end < text.length) snippet = snippet + ' …';
    return snippet;
};

export const search = asyncHandler(async (req, res) => {
    const rawQuery = (req.query.q || '').toString().trim();
    const limit = Math.min(parseInt(req.query.limit || '10', 10) || 10, 25);

    const rawCategory = (req.query.category || '').toString();
    const rawDifficulty = (req.query.difficulty || '').toString();
    const rawReadTime = (req.query.readTime || '').toString();

    const category = ALLOWED_CATEGORIES.has(rawCategory) ? rawCategory : null;
    const difficulty = ALLOWED_DIFFICULTIES.has(rawDifficulty) ? rawDifficulty : null;
    const readTimeFilter = READ_TIME_BUCKETS[rawReadTime] || null;
    const hasArticleFilter = Boolean(category || difficulty || readTimeFilter);

    if (rawQuery.length < 2) {
        return res.json({ query: rawQuery, articles: [], glossary: [] });
    }

    const pattern = new RegExp(escapeRegex(rawQuery), 'i');
    const overfetch = limit * 3;
    const articleProjection = { title: 1, summary: 1, content: 1, category: 1, difficulty: 1, imageUrl: 1, readingTime: 1, _ownerId: 1 };

    const sharedArticleFilter = { status: 'published' };
    if (category) sharedArticleFilter.category = category;
    if (difficulty) sharedArticleFilter.difficulty = difficulty;
    if (readTimeFilter) sharedArticleFilter.readingTime = readTimeFilter;

    const titleSummaryPromise = Article.find(
        {
            ...sharedArticleFilter,
            $or: [{ title: pattern }, { summary: pattern }],
        },
        articleProjection,
    )
        .limit(overfetch)
        .lean();

    const textPromise = Article.find(
        { ...sharedArticleFilter, $text: { $search: rawQuery } },
        { ...articleProjection, _textScore: { $meta: 'textScore' } },
    )
        .sort({ _textScore: { $meta: 'textScore' } })
        .limit(overfetch)
        .lean();

    const glossaryPromise = hasArticleFilter
        ? Promise.resolve([])
        : GlossaryTerm.find(
            {
                $or: [
                    { term: pattern },
                    { definition: pattern },
                ],
            },
            { term: 1, definition: 1, category: 1 }
        )
            .limit(overfetch)
            .lean();

    const [titleSummaryMatches, textMatches, glossary] = await Promise.all([
        titleSummaryPromise,
        textPromise,
        glossaryPromise,
    ]);

    const articleMap = new Map();
    for (const a of titleSummaryMatches) articleMap.set(String(a._id), a);
    for (const a of textMatches) {
        if (!articleMap.has(String(a._id))) articleMap.set(String(a._id), a);
    }
    const articles = Array.from(articleMap.values());

    const matches = (hay) => Boolean(hay) && hay.toLowerCase().includes(rawQuery.toLowerCase());
    const rank = (hay, weight) => (matches(hay) ? weight : 0);

    const rankedArticles = articles
        .map((a) => {
            const baseScore = rank(a.title, 10) + rank(a.summary, 5) + rank(a.content, 1);
            const score = baseScore === 0 ? 1 : baseScore;
            return { article: a, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(({ article }) => {
            const titleHit = matches(article.title);
            const summaryHit = matches(article.summary);
            const contentHit = matches(article.content);
            const contentSnippet = (!titleHit && !summaryHit && contentHit)
                ? extractSnippet(article.content, rawQuery)
                : '';
            const { content, _textScore, ...rest } = article;
            return contentSnippet ? { ...rest, contentSnippet } : rest;
        });

    const rankedGlossary = glossary
        .map((g) => ({
            term: g,
            score: rank(g.term, 10) + rank(g.definition, 2),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(({ term }) => term);

    res.json({ query: rawQuery, articles: rankedArticles, glossary: rankedGlossary });
});
