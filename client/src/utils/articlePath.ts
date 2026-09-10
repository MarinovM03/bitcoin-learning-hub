interface Addressable {
    _id: string;
    slug?: string;
}

export const articlePath = (article: Addressable): string =>
    `/articles/${article.slug || article._id}`;

export const articlePathFromId = (articleId: string): string => `/articles/${articleId}`;
