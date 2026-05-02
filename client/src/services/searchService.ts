import * as request from '../utils/requester';
import type { Article, GlossaryTerm } from '../types';

const baseUrl = `${import.meta.env.VITE_API_URL}/search`;

export type SearchArticleHit = Pick<
    Article,
    '_id' | 'title' | 'summary' | 'category' | 'difficulty' | 'imageUrl' | 'readingTime' | '_ownerId'
> & {
    contentSnippet?: string;
};

export type SearchGlossaryHit = Pick<GlossaryTerm, '_id' | 'term' | 'definition' | 'category'>;

export interface SearchResponse {
    query: string;
    articles: SearchArticleHit[];
    glossary: SearchGlossaryHit[];
}

export type ReadTimeBucket = 'short' | 'medium' | 'long';

export interface SearchFilters {
    category?: string;
    difficulty?: string;
    readTime?: ReadTimeBucket;
}

export const search = (
    query: string,
    limit: number = 10,
    filters: SearchFilters = {}
): Promise<SearchResponse> => {
    const params = new URLSearchParams({ q: query, limit: String(limit) });
    if (filters.category) params.set('category', filters.category);
    if (filters.difficulty) params.set('difficulty', filters.difficulty);
    if (filters.readTime) params.set('readTime', filters.readTime);
    return request.get<SearchResponse>(`${baseUrl}?${params.toString()}`);
};
