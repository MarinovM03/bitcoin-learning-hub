export const queryKeys = {
    articles: {
        all: ['articles'],
        lists: ['articles', 'list'],
        list: (filters: unknown) => ['articles', 'list', filters],
        mine: ['articles', 'mine'],
        trending: ['articles', 'trending'],
        readHistory: ['articles', 'read-history'],
        detail: (id?: string) => ['articles', 'detail', id],
        related: (id?: string) => ['articles', 'related', id],
    },
    glossary: {
        all: ['glossary'],
        list: ['glossary', 'list'],
        detail: (id?: string) => ['glossary', 'detail', id],
    },
    collections: {
        all: ['collections'],
        list: (author?: string) => ['collections', 'list', author ?? 'all'],
        mine: ['collections', 'mine'],
        detail: (slug?: string) => ['collections', 'detail', slug],
        forArticle: (articleId?: string) => ['collections', 'article', articleId],
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
    follows: {
        all: ['follows'],
        summary: (targetType?: string, targetId?: string) => ['follows', targetType, targetId],
        following: ['follows', 'following'],
        feed: ['follows', 'feed'],
        feedPage: (page: number, limit: number, author: string) =>
            ['follows', 'feed', 'page', page, limit, author],
    },
    publicProfile: (userId?: string) => ['users', userId, 'public'],
    admin: {
        all: ['admin'],
        stats: ['admin', 'stats'],
        users: (params: unknown) => ['admin', 'users', params],
        articles: (params: unknown) => ['admin', 'articles', params],
        comments: (params: unknown) => ['admin', 'comments', params],
        moderation: (params: unknown) => ['admin', 'moderation', params],
        preview: (articleId?: string) => ['admin', 'preview', articleId],
        reports: (params: unknown) => ['admin', 'reports', params],
    },
    transactions: {
        all: ['transactions'],
        detail: (txid?: string) => ['transactions', txid],
    },
    market: {
        binance: ['market', 'binance'],
        global: ['market', 'global'],
        fearGreed: ['market', 'fear-greed'],
    },
};
