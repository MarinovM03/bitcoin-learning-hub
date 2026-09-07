import * as request from '../utils/requester';
import type { Article, ArticleCategory, ArticleDifficulty, ArticleStatus, ArticleDetail, QuizFormQuestion } from '../types';
import { API_BASE_URL } from '../lib/apiConfig';

const baseUrl = `${API_BASE_URL}/articles`;
const usersUrl = `${API_BASE_URL}/users`;

export type ArticleSort = 'latest' | 'views';

export interface ArticleListOptions {
    page?: number;
    limit?: number;
    sort?: ArticleSort;
    search?: string;
    category?: ArticleCategory | 'All' | '';
    difficulty?: ArticleDifficulty | 'All' | '';
}

export interface ArticleListResponse {
    articles: Article[];
    total: number;
    page: number;
    totalPages: number;
}

export interface ArticleWriteData {
    title: string;
    category: ArticleCategory;
    difficulty?: ArticleDifficulty;
    imageUrl: string;
    summary: string;
    content: string;
    status?: ArticleStatus;
    quiz?: QuizFormQuestion[];
}

export interface RelatedArticle {
    _id: string;
    title: string;
    summary: string;
    imageUrl: string;
    category: ArticleCategory;
}

export interface PublicProfile {
    username: string;
    profilePicture?: string;
    joinedAt?: string;
    articles: Article[];
    totalLikes: number;
}

export interface TrendingArticle {
    _id: string;
    title: string;
    summary: string;
    imageUrl: string;
    category: ArticleCategory;
    likeCount: number;
}

export interface DeleteResponse {
    message: string;
}

export const getAll = ({
    page = 1,
    limit = 12,
    sort = 'latest',
    search = '',
    category = '',
    difficulty = '',
}: ArticleListOptions = {}): Promise<ArticleListResponse> => {
    const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        sort,
    });
    if (search.trim()) params.set('search', search.trim());
    if (category && category !== 'All') params.set('category', category);
    if (difficulty && difficulty !== 'All') params.set('difficulty', difficulty);

    return request.get<ArticleListResponse>(`${baseUrl}?${params.toString()}`);
};

export const getMyArticles = (): Promise<Article[]> =>
    request.get<Article[]>(`${baseUrl}/my`);

export const getOne = (articleId: string): Promise<ArticleDetail> =>
    request.get<ArticleDetail>(`${baseUrl}/${articleId}`);

export const getRelated = (articleId: string): Promise<RelatedArticle[]> =>
    request.get<RelatedArticle[]>(`${baseUrl}/${articleId}/related`);

export const getPublicProfile = (userId: string): Promise<PublicProfile> =>
    request.get<PublicProfile>(`${usersUrl}/${userId}/public`);

export const create = (data: ArticleWriteData): Promise<Article> =>
    request.post<Article>(baseUrl, data);

export const remove = (articleId: string): Promise<DeleteResponse> =>
    request.del<DeleteResponse>(`${baseUrl}/${articleId}`);

export const edit = (articleId: string, data: ArticleWriteData): Promise<Article> =>
    request.put<Article>(`${baseUrl}/${articleId}`, data);

export const getTrending = (): Promise<TrendingArticle[]> =>
    request.get<TrendingArticle[]>(`${baseUrl}/trending`);

export interface QuizCheckResponse {
    isCorrect: boolean;
    correctIndex: number;
}

export const checkQuizAnswer = (
    articleId: string,
    questionIndex: number,
    answerIndex: number,
): Promise<QuizCheckResponse> =>
    request.post<QuizCheckResponse>(`${baseUrl}/${articleId}/quiz/check`, { questionIndex, answerIndex });

export interface ReadStateResponse {
    read: boolean;
}

export const markRead = (articleId: string): Promise<ReadStateResponse> =>
    request.post<ReadStateResponse>(`${baseUrl}/${articleId}/read`);

export const markUnread = (articleId: string): Promise<ReadStateResponse> =>
    request.del<ReadStateResponse>(`${baseUrl}/${articleId}/read`);

export interface ResetReadHistoryResponse {
    cleared: number;
}

export const resetReadHistory = (): Promise<ResetReadHistoryResponse> =>
    request.del<ResetReadHistoryResponse>(`${usersUrl}/me/read-history`);
