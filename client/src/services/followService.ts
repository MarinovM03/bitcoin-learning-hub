import * as request from '../utils/requester';
import { API_BASE_URL } from '../lib/apiConfig';
import type { Article } from '../types';

export type FollowTarget = 'user' | 'collection';

export interface FollowSummary {
    followers: number;
    following: number;
    followedByMe: boolean;
}

export interface FollowToggleResult {
    following: boolean;
    followers: number;
}

export interface FeedPage {
    articles: Article[];
    total: number;
    page: number;
    totalPages: number;
    following: number;
}

export const getSummary = (targetType: FollowTarget, targetId: string): Promise<FollowSummary> =>
    request.get<FollowSummary>(`${API_BASE_URL}/follows/${targetType}/${targetId}`);

export const toggle = (targetType: FollowTarget, targetId: string): Promise<FollowToggleResult> =>
    request.post<FollowToggleResult>(`${API_BASE_URL}/follows`, { targetType, targetId });

export const getFeed = (limit = 6): Promise<FeedPage> =>
    request.get<FeedPage>(`${API_BASE_URL}/feed?limit=${limit}`);
