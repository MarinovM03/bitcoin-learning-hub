import * as request from '../utils/requester';

const baseUrl = `${import.meta.env.VITE_API_URL}/admin`;

export interface AdminStats {
    users: { total: number; admins: number; lastWeek: number };
    articles: { total: number; published: number; drafts: number; featured: number };
    comments: { total: number; lastWeek: number };
    glossary: { total: number };
    paths: { total: number };
    bookmarks: { total: number };
    likes: { total: number };
}

export interface AdminUserRow {
    _id: string;
    username: string;
    email: string;
    profilePicture?: string;
    role: 'user' | 'admin';
}

export interface AdminUsersResponse {
    users: AdminUserRow[];
    total: number;
    page: number;
    totalPages: number;
}

export interface AdminArticleRow {
    _id: string;
    title: string;
    category: string;
    status: 'draft' | 'published';
    featured: boolean;
    views: number;
    createdAt: string;
    _ownerId: { _id: string; username: string } | null;
}

export interface AdminArticlesResponse {
    articles: AdminArticleRow[];
    total: number;
    page: number;
    totalPages: number;
}

export interface AdminCommentRow {
    _id: string;
    text: string;
    createdAt: string;
    _ownerId: { _id: string; username: string; profilePicture?: string } | null;
    articleId: { _id: string; title: string } | null;
}

export interface AdminCommentsResponse {
    comments: AdminCommentRow[];
    total: number;
    page: number;
    totalPages: number;
}

export const getStats = (): Promise<AdminStats> =>
    request.get<AdminStats>(`${baseUrl}/stats`);

export const getUsers = (params: { search?: string; page?: number; limit?: number } = {}): Promise<AdminUsersResponse> => {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return request.get<AdminUsersResponse>(`${baseUrl}/users${qs ? `?${qs}` : ''}`);
};

export const updateUserRole = (userId: string, role: 'user' | 'admin'): Promise<AdminUserRow> =>
    request.patch<AdminUserRow>(`${baseUrl}/users/${userId}/role`, { role });

export const deleteUser = (userId: string): Promise<{ message: string }> =>
    request.del<{ message: string }>(`${baseUrl}/users/${userId}`);

export const getArticles = (params: { search?: string; page?: number; limit?: number } = {}): Promise<AdminArticlesResponse> => {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return request.get<AdminArticlesResponse>(`${baseUrl}/articles${qs ? `?${qs}` : ''}`);
};

export const deleteArticle = (articleId: string): Promise<{ message: string }> =>
    request.del<{ message: string }>(`${baseUrl}/articles/${articleId}`);

export const toggleFeatured = (articleId: string): Promise<{ _id: string; featured: boolean }> =>
    request.patch<{ _id: string; featured: boolean }>(`${baseUrl}/articles/${articleId}/featured`);

export const getComments = (params: { page?: number; limit?: number } = {}): Promise<AdminCommentsResponse> => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return request.get<AdminCommentsResponse>(`${baseUrl}/comments${qs ? `?${qs}` : ''}`);
};

export const deleteComment = (commentId: string): Promise<{ message: string }> =>
    request.del<{ message: string }>(`${baseUrl}/comments/${commentId}`);
