import * as request from '../utils/requester';
import { API_BASE_URL } from '../lib/apiConfig';

const baseUrl = `${API_BASE_URL}/admin`;

export interface AdminStats {
    users: { total: number; admins: number; lastWeek: number };
    articles: { total: number; published: number; drafts: number; pending: number; featured: number };
    comments: { total: number; lastWeek: number };
    glossary: { total: number; pending: number };
    bookmarks: { total: number };
    likes: { total: number };
}

export interface AdminUserRow {
    _id: string;
    username: string;
    email: string;
    profilePicture?: string;
    role: 'user' | 'admin';
    isTrusted?: boolean;
    approvedArticles?: number;
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
    status: 'draft' | 'pending' | 'published';
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

type QueryParams = Record<string, string | number | undefined>;

const withQuery = (url: string, params: QueryParams): string => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== '') query.set(key, String(value));
    }
    const qs = query.toString();
    return qs ? `${url}?${qs}` : url;
};

export const getStats = (): Promise<AdminStats> =>
    request.get<AdminStats>(`${baseUrl}/stats`);

export const getUsers = (params: { search?: string; page?: number; limit?: number } = {}): Promise<AdminUsersResponse> =>
    request.get<AdminUsersResponse>(withQuery(`${baseUrl}/users`, params));

export const updateUserRole = (userId: string, role: 'user' | 'admin'): Promise<AdminUserRow> =>
    request.patch<AdminUserRow>(`${baseUrl}/users/${userId}/role`, { role });

export const deleteUser = (userId: string): Promise<{ message: string }> =>
    request.del<{ message: string }>(`${baseUrl}/users/${userId}`);

export const getArticles = (params: { search?: string; page?: number; limit?: number } = {}): Promise<AdminArticlesResponse> =>
    request.get<AdminArticlesResponse>(withQuery(`${baseUrl}/articles`, params));

export const deleteArticle = (articleId: string): Promise<{ message: string }> =>
    request.del<{ message: string }>(`${baseUrl}/articles/${articleId}`);

export const toggleFeatured = (articleId: string): Promise<{ _id: string; featured: boolean }> =>
    request.patch<{ _id: string; featured: boolean }>(`${baseUrl}/articles/${articleId}/featured`);

export const getComments = (params: { page?: number; limit?: number } = {}): Promise<AdminCommentsResponse> =>
    request.get<AdminCommentsResponse>(withQuery(`${baseUrl}/comments`, params));

export const deleteComment = (commentId: string): Promise<{ message: string }> =>
    request.del<{ message: string }>(`${baseUrl}/comments/${commentId}`);

export interface ModerationAuthor {
    _id: string;
    username: string;
    profilePicture?: string;
}

export interface ModerationArticle {
    _id: string;
    title: string;
    category: string;
    difficulty: string;
    summary: string;
    imageUrl: string;
    readingTime: number;
    createdAt: string;
    _ownerId: ModerationAuthor | null;
}

export interface ModerationTerm {
    _id: string;
    term: string;
    definition: string;
    category: string;
    createdAt: string;
    _ownerId: ModerationAuthor | null;
}

export interface ModerationQueueResponse {
    articles: ModerationArticle[];
    terms: ModerationTerm[];
    articleTotal: number;
    termTotal: number;
    page: number;
    totalPages: number;
}

export interface ArticlePreview extends ModerationArticle {
    content: string;
    status: 'draft' | 'pending' | 'published';
    quiz?: { question: string; options: string[]; correctIndex: number }[];
    seriesName?: string;
    seriesPart?: number | null;
}

export const getModerationQueue = (params: { page?: number; limit?: number } = {}): Promise<ModerationQueueResponse> =>
    request.get<ModerationQueueResponse>(withQuery(`${baseUrl}/moderation/queue`, params));

export const getArticlePreview = (articleId: string): Promise<ArticlePreview> =>
    request.get<ArticlePreview>(`${baseUrl}/articles/${articleId}/preview`);

export const approveArticle = (articleId: string): Promise<{ _id: string; status: string }> =>
    request.post<{ _id: string; status: string }>(`${baseUrl}/articles/${articleId}/approve`);

export const rejectArticle = (articleId: string, note: string): Promise<{ _id: string; status: string; moderationNote: string }> =>
    request.post<{ _id: string; status: string; moderationNote: string }>(`${baseUrl}/articles/${articleId}/reject`, { note });

export const approveGlossaryTerm = (termId: string): Promise<{ _id: string; status: string }> =>
    request.post<{ _id: string; status: string }>(`${baseUrl}/glossary/${termId}/approve`);

export const deleteGlossaryTerm = (termId: string): Promise<{ message: string }> =>
    request.del<{ message: string }>(`${baseUrl}/glossary/${termId}`);

export const updateUserTrust = (userId: string, isTrusted: boolean): Promise<AdminUserRow> =>
    request.patch<AdminUserRow>(`${baseUrl}/users/${userId}/trust`, { isTrusted });

export type ReportStatus = 'open' | 'resolved' | 'dismissed';

export interface AdminReportRow {
    _id: string;
    targetType: 'article' | 'comment' | 'glossary';
    targetId: string;
    reason: string;
    note: string;
    status: ReportStatus;
    createdAt: string;
    _reporterId: { _id: string; username: string } | null;
    target: { label: string; status?: string; articleId?: string } | null;
}

export interface AdminReportsResponse {
    reports: AdminReportRow[];
    total: number;
    openTotal: number;
    page: number;
    totalPages: number;
}

export const getReports = (params: { page?: number; limit?: number; status?: ReportStatus } = {}): Promise<AdminReportsResponse> =>
    request.get<AdminReportsResponse>(withQuery(`${baseUrl}/reports`, params));

export const resolveReport = (reportId: string, status: 'resolved' | 'dismissed'): Promise<{ _id: string; status: ReportStatus }> =>
    request.patch<{ _id: string; status: ReportStatus }>(`${baseUrl}/reports/${reportId}`, { status });
