import type { ArticleOwnerRef } from './article';

export interface Comment {
    _id: string;
    articleId: string;
    _ownerId: string | ArticleOwnerRef;
    ownerUsername: string;
    ownerProfilePicture?: string;
    text: string;
    createdAt: string;
}
