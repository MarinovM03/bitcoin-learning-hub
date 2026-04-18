import * as request from '../utils/requester';
import type { Comment } from '../types';

const baseUrl = `${import.meta.env.VITE_API_URL}/comments`;

export interface DeleteResponse {
    message: string;
}

export const getAllForArticle = async (articleId: string): Promise<Comment[]> => {
    try {
        return await request.get<Comment[]>(`${baseUrl}/${articleId}`);
    } catch {
        return [];
    }
};

export const create = (articleId: string, text: string): Promise<Comment> =>
    request.post<Comment>(baseUrl, { articleId, text });

export const remove = (commentId: string): Promise<DeleteResponse> =>
    request.del<DeleteResponse>(`${baseUrl}/${commentId}`);
