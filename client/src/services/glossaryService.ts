import * as request from '../utils/requester';
import type { GlossaryTerm, GlossaryTermDetail, GlossaryCategory } from '../types';
import { API_BASE_URL } from '../lib/apiConfig';

const baseUrl = `${API_BASE_URL}/glossary`;

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

export const getOne = (termId: string): Promise<GlossaryTermDetail> =>
    request.get<GlossaryTermDetail>(`${baseUrl}/${termId}`);

export const create = (data: GlossaryWriteData): Promise<GlossaryTerm> =>
    request.post<GlossaryTerm>(baseUrl, data);

export const remove = (termId: string): Promise<DeleteResponse> =>
    request.del<DeleteResponse>(`${baseUrl}/${termId}`);
