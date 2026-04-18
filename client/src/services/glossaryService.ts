import * as request from '../utils/requester';
import type { GlossaryTerm, GlossaryCategory } from '../types';

const baseUrl = `${import.meta.env.VITE_API_URL}/glossary`;

export interface GlossaryWriteData {
    term: string;
    definition: string;
    extendedDefinition?: string;
    examples?: string[];
    category: GlossaryCategory;
}

export interface DeleteResponse {
    message: string;
}

export const getAll = (): Promise<GlossaryTerm[]> =>
    request.get<GlossaryTerm[]>(baseUrl);

export const getOne = (termId: string): Promise<GlossaryTerm> =>
    request.get<GlossaryTerm>(`${baseUrl}/${termId}`);

export const create = (data: GlossaryWriteData): Promise<GlossaryTerm> =>
    request.post<GlossaryTerm>(baseUrl, data);

export const remove = (termId: string): Promise<DeleteResponse> =>
    request.del<DeleteResponse>(`${baseUrl}/${termId}`);
