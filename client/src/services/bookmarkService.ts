import * as request from '../utils/requester';
import type { Article } from '../types';
import { API_BASE_URL } from '../lib/apiConfig';

const baseUrl = `${API_BASE_URL}/bookmarks`;

export interface BookmarkToggleResponse {
    bookmarked: boolean;
}

export const toggle = (articleId: string): Promise<BookmarkToggleResponse> =>
    request.post<BookmarkToggleResponse>(baseUrl, { articleId });

export const getMyBookmarks = (): Promise<Article[]> =>
    request.get<Article[]>(baseUrl);
