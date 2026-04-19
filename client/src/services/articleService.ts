import * as request from '../utils/requester';
import type { Article, ArticleCategory, ArticleDifficulty, ArticleStatus, QuizQuestion } from '../types';

const baseUrl = `${import.meta.env.VITE_API_URL}/articles`;
const usersUrl = `${import.meta.env.VITE_API_URL}/users`;

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
    quiz?: QuizQuestion[];
    seriesName?: string;
    seriesPart?: number | null;
}

export interface RelatedArticle {
    _id: string;
    title: string;
    summary: string;
    imageUrl: string;
    category: ArticleCategory;
}

export interface SeriesPart {
    _id: string;
    title: string;
    seriesPart: number | null;
    imageUrl: string;
    category: ArticleCategory;
    readingTime: number;
}

export interface SeriesResponse {
    seriesName: string;
    parts: SeriesPart[];
}

export interface MySeriesPartsResponse {
    parts: number[];
}

export interface PublicProfile {
    username: string;
    profilePicture?: string;
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

export const getOne = (articleId: string): Promise<Article> =>
    request.get<Article>(`${baseUrl}/${articleId}`);

export const getRelated = (articleId: string): Promise<RelatedArticle[]> =>
    request.get<RelatedArticle[]>(`${baseUrl}/${articleId}/related`);

export const getSeries = (articleId: string): Promise<SeriesResponse> =>
    request.get<SeriesResponse>(`${baseUrl}/${articleId}/series`);

export const getMySeriesParts = (name: string, excludeId?: string): Promise<MySeriesPartsResponse> => {
    const params = new URLSearchParams({ name });
    if (excludeId) params.set('excludeId', excludeId);
    return request.get<MySeriesPartsResponse>(`${baseUrl}/series/mine?${params.toString()}`);
};

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

export interface ReadStateResponse {
    read: boolean;
}

export const markRead = (articleId: string): Promise<ReadStateResponse> =>
    request.post<ReadStateResponse>(`${baseUrl}/${articleId}/read`);

export const markUnread = (articleId: string): Promise<ReadStateResponse> =>
    request.del<ReadStateResponse>(`${baseUrl}/${articleId}/read`);
