export const queryKeys = {
    articles: {
        all: ['articles'],
        list: (filters) => ['articles', 'list', filters],
        mine: ['articles', 'mine'],
        trending: ['articles', 'trending'],
        detail: (id) => ['articles', 'detail', id],
        related: (id) => ['articles', 'related', id],
        series: (id) => ['articles', 'series', id],
    },
    glossary: {
        all: ['glossary'],
        list: ['glossary', 'list'],
        detail: (id) => ['glossary', 'detail', id],
    },
    paths: {
        all: ['paths'],
        list: (filters) => ['paths', 'list', filters],
        mine: ['paths', 'mine'],
        detail: (id) => ['paths', 'detail', id],
    },
    bookmarks: {
        all: ['bookmarks'],
        list: ['bookmarks', 'list'],
    },
    likes: {
        forArticle: (articleId) => ['likes', articleId],
    },
    comments: {
        forArticle: (articleId) => ['comments', articleId],
    },
    certifications: {
        all: ['certifications'],
        mine: ['certifications', 'mine'],
        detail: (id) => ['certifications', 'detail', id],
    },
    publicProfile: (userId) => ['users', userId, 'public'],
};
