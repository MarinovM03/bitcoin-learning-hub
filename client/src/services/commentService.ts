import * as request from '../utils/requester';
import type { Comment } from '../types';
import { API_BASE_URL } from '../lib/apiConfig';

const baseUrl = `${API_BASE_URL}/comments`;

export interface DeleteResponse {
    message: string;
}

export interface CommentPage {
    comments: Comment[];
    total: number;
    page: number;
    totalPages: number;
}

export const PAGE_SIZE = 20;

export const getPageForArticle = (articleId: string, page: number): Promise<CommentPage> =>
    request.get<CommentPage>(`${baseUrl}/${articleId}?page=${page}&limit=${PAGE_SIZE}`);

export const create = (articleId: string, text: string): Promise<Comment> =>
    request.post<Comment>(baseUrl, { articleId, text });

export const update = (commentId: string, text: string): Promise<Comment> =>
    request.put<Comment>(`${baseUrl}/${commentId}`, { text });

export const remove = (commentId: string): Promise<DeleteResponse> =>
    request.del<DeleteResponse>(`${baseUrl}/${commentId}`);
