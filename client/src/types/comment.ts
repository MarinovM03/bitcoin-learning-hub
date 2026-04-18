export interface Comment {
    _id: string;
    articleId: string;
    _ownerId: string;
    ownerUsername: string;
    ownerProfilePicture?: string;
    text: string;
    createdAt: string;
}
