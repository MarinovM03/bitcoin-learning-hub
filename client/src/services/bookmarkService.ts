import * as request from '../utils/requester';
import type { Article } from '../types';

const baseUrl = `${import.meta.env.VITE_API_URL}/bookmarks`;

export interface BookmarkToggleResponse {
    bookmarked: boolean;
}

export const toggle = (articleId: string): Promise<BookmarkToggleResponse> =>
    request.post<BookmarkToggleResponse>(baseUrl, { articleId });

export const getMyBookmarks = (): Promise<Article[]> =>
    request.get<Article[]>(baseUrl);
