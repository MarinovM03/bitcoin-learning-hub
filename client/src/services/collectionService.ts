import * as request from '../utils/requester';
import { API_BASE_URL } from '../lib/apiConfig';
import type { Article } from '../types';

const baseUrl = `${API_BASE_URL}/collections`;

export interface CollectionOwner {
    _id: string;
    username: string;
    profilePicture?: string;
}

export interface CollectionSummary {
    _id: string;
    title: string;
    slug: string;
    description: string;
    coverImage: string;
    articleCount: number;
    _ownerId: CollectionOwner | null;
    createdAt: string;
}

export interface CollectionDetail {
    _id: string;
    title: string;
    slug: string;
    description: string;
    coverImage: string;
    articles: Article[];
    _ownerId: CollectionOwner | null;
    createdAt: string;
    updatedAt: string;
}

export interface MyCollection {
    _id: string;
    title: string;
    slug: string;
    description: string;
    coverImage: string;
    articles: { _id: string; title: string; status: string }[];
}

export interface ArticleMembership {
    _id: string;
    title: string;
    slug: string;
    total: number;
    position: number;
    parts: { _id: string; title: string }[];
    prev: { _id: string; title: string } | null;
    next: { _id: string; title: string } | null;
}

export interface CollectionWriteData {
    title?: string;
    description?: string;
    coverImage?: string;
    articles?: string[];
}

export const getAll = (author?: string): Promise<CollectionSummary[]> =>
    request.get<CollectionSummary[]>(author ? `${baseUrl}?author=${author}` : baseUrl);

export const getMine = (): Promise<MyCollection[]> =>
    request.get<MyCollection[]>(`${baseUrl}/mine`);

export const getBySlug = (slug: string): Promise<CollectionDetail> =>
    request.get<CollectionDetail>(`${baseUrl}/${slug}`);

export const getForArticle = (articleId: string): Promise<ArticleMembership[]> =>
    request.get<ArticleMembership[]>(`${API_BASE_URL}/articles/${articleId}/collections`);

export const create = (data: CollectionWriteData): Promise<CollectionDetail> =>
    request.post<CollectionDetail>(baseUrl, data);

export const update = (collectionId: string, data: CollectionWriteData): Promise<CollectionDetail> =>
    request.put<CollectionDetail>(`${baseUrl}/${collectionId}`, data);

export const remove = (collectionId: string): Promise<{ message: string }> =>
    request.del<{ message: string }>(`${baseUrl}/${collectionId}`);
