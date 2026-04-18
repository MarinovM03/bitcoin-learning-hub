import * as request from '../utils/requester';
import type { Like } from '../types';

const baseUrl = `${import.meta.env.VITE_API_URL}/likes`;

export const like = (articleId: string): Promise<Like> =>
    request.post<Like>(baseUrl, { articleId });

export const getAllForArticle = async (articleId: string): Promise<Like[]> => {
    try {
        return await request.get<Like[]>(`${baseUrl}/${articleId}`);
    } catch {
        return [];
    }
};
