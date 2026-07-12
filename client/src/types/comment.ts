import type { ArticleOwnerRef } from './article';

export interface Comment {
    _id: string;
    articleId: string;
    _ownerId: ArticleOwnerRef;
    text: string;
    createdAt: string;
}
