export const queryKeys = {
    articles: {
        all: ['articles'],
        list: (filters: unknown) => ['articles', 'list', filters],
        mine: ['articles', 'mine'],
        trending: ['articles', 'trending'],
        detail: (id?: string) => ['articles', 'detail', id],
        related: (id?: string) => ['articles', 'related', id],
        series: (id?: string) => ['articles', 'series', id],
    },
    glossary: {
        all: ['glossary'],
        list: ['glossary', 'list'],
        detail: (id?: string) => ['glossary', 'detail', id],
    },
    bookmarks: {
        all: ['bookmarks'],
        list: ['bookmarks', 'list'],
    },
    likes: {
        forArticle: (articleId?: string) => ['likes', articleId],
    },
    comments: {
        forArticle: (articleId?: string) => ['comments', articleId],
    },
    publicProfile: (userId?: string) => ['users', userId, 'public'],
    market: {
        binance: ['market', 'binance'],
        global: ['market', 'global'],
        fearGreed: ['market', 'fear-greed'],
        mempoolStats: ['market', 'mempool', 'stats'],
        mempoolTxs: ['market', 'mempool', 'txs'],
    },
};
