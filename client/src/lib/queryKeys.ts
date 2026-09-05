export const queryKeys = {
    articles: {
        all: ['articles'],
        lists: ['articles', 'list'],
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
    market: {
        binance: ['market', 'binance'],
        global: ['market', 'global'],
        fearGreed: ['market', 'fear-greed'],
    },
};
