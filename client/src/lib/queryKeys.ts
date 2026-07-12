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
    paths: {
        all: ['paths'],
        list: (filters: unknown) => ['paths', 'list', filters],
        mine: ['paths', 'mine'],
        detail: (id?: string) => ['paths', 'detail', id],
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
    certifications: {
        all: ['certifications'],
        mine: ['certifications', 'mine'],
        detail: (id?: string) => ['certifications', 'detail', id],
    },
    publicProfile: (userId?: string) => ['users', userId, 'public'],
    market: {
        binance: ['market', 'binance'],
        global: ['market', 'global'],
    },
};
