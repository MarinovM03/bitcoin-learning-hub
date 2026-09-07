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

export interface FollowedUser {
    _id: string;
    username: string;
    profilePicture?: string;
}

export interface FollowedCollection {
    _id: string;
    title: string;
    slug: string;
    coverImage?: string;
    articleCount: number;
    _ownerId: { _id: string; username: string } | null;
}

export interface FollowingList {
    users: FollowedUser[];
    collections: FollowedCollection[];
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

export const getFollowing = (): Promise<FollowingList> =>
    request.get<FollowingList>(`${API_BASE_URL}/follows/following`);

export const getFeed = (page = 1, limit = 6): Promise<FeedPage> =>
    request.get<FeedPage>(`${API_BASE_URL}/feed?page=${page}&limit=${limit}`);
