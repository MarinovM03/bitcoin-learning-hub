import * as request from '../utils/requester';
import type { Like } from '../types';

const baseUrl = `${import.meta.env.VITE_API_URL}/likes`;

export interface LikeToggleResponse {
    liked: boolean;
    totalLikes: number;
}

export const toggle = (articleId: string): Promise<LikeToggleResponse> =>
    request.post<LikeToggleResponse>(baseUrl, { articleId });

export const getAllForArticle = async (articleId: string): Promise<Like[]> => {
    try {
        return await request.get<Like[]>(`${baseUrl}/${articleId}`);
    } catch {
        return [];
    }
};
