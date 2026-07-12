import * as request from '../utils/requester';
import { API_BASE_URL } from '../lib/apiConfig';

const baseUrl = `${API_BASE_URL}/likes`;

export interface LikeToggleResponse {
    liked: boolean;
    totalLikes: number;
}

export interface LikeSummary {
    totalLikes: number;
    likedByMe: boolean;
}

export const toggle = (articleId: string): Promise<LikeToggleResponse> =>
    request.post<LikeToggleResponse>(baseUrl, { articleId });

export const getSummary = async (articleId: string): Promise<LikeSummary> => {
    try {
        return await request.get<LikeSummary>(`${baseUrl}/${articleId}`);
    } catch {
        return { totalLikes: 0, likedByMe: false };
    }
};
