import * as request from '../utils/requester';
import type { Article, ArticleDifficulty, LearningPath } from '../types';

const baseUrl = `${import.meta.env.VITE_API_URL}/paths`;

export interface PathListOptions {
    page?: number;
    limit?: number;
    difficulty?: ArticleDifficulty | 'All' | '';
}

export interface PathArticleCard {
    _id: string;
    title: string;
    imageUrl: string;
}

export type LearningPathSummary = Omit<LearningPath, 'articles'> & {
    articles: PathArticleCard[];
};

export interface PathListResponse {
    paths: LearningPathSummary[];
    total: number;
    page: number;
    totalPages: number;
}

export interface PathProgress {
    completed: number;
    total: number;
    completedIds: string[];
}

export type PathArticleDetail = Pick<
    Article,
    '_id' | 'title' | 'summary' | 'imageUrl' | 'category' | 'difficulty' | 'readingTime' | 'status' | '_ownerId'
>;

export interface LearningPathDetail extends Omit<LearningPath, 'articles'> {
    articles: PathArticleDetail[];
    progress: PathProgress;
}

export interface PathWriteData {
    title: string;
    description: string;
    difficulty?: ArticleDifficulty;
    coverImage?: string;
    articles?: string[];
}

export interface DeleteResponse {
    message: string;
}

export const getAll = ({ page = 1, limit = 12, difficulty = '' }: PathListOptions = {}): Promise<PathListResponse> => {
    const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
    });
    if (difficulty && difficulty !== 'All') params.set('difficulty', difficulty);
    return request.get<PathListResponse>(`${baseUrl}?${params.toString()}`);
};

export const getMyPaths = (): Promise<LearningPathSummary[]> =>
    request.get<LearningPathSummary[]>(`${baseUrl}/my`);

export const getOne = (pathId: string): Promise<LearningPathDetail> =>
    request.get<LearningPathDetail>(`${baseUrl}/${pathId}`);

export const create = (data: PathWriteData): Promise<LearningPath> =>
    request.post<LearningPath>(baseUrl, data);

export const edit = (pathId: string, data: PathWriteData): Promise<LearningPath> =>
    request.put<LearningPath>(`${baseUrl}/${pathId}`, data);

export const remove = (pathId: string): Promise<DeleteResponse> =>
    request.del<DeleteResponse>(`${baseUrl}/${pathId}`);
