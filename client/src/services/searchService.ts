import * as request from '../utils/requester';
import type { Article, GlossaryTerm } from '../types';

const baseUrl = `${import.meta.env.VITE_API_URL}/search`;

export type SearchArticleHit = Pick<
    Article,
    '_id' | 'title' | 'summary' | 'category' | 'difficulty' | 'imageUrl' | 'readingTime' | '_ownerId'
>;

export type SearchGlossaryHit = Pick<GlossaryTerm, '_id' | 'term' | 'definition' | 'category'>;

export interface SearchResponse {
    query: string;
    articles: SearchArticleHit[];
    glossary: SearchGlossaryHit[];
}

export const search = (query: string, limit: number = 10): Promise<SearchResponse> => {
    const params = new URLSearchParams({ q: query, limit: String(limit) });
    return request.get<SearchResponse>(`${baseUrl}?${params.toString()}`);
};
