import * as request from '../utils/requester';

const baseUrl = `${import.meta.env.VITE_API_URL}/search`;

export const search = async (query, limit = 10) => {
    const params = new URLSearchParams({ q: query, limit: String(limit) });
    const result = await request.get(`${baseUrl}?${params.toString()}`);
    return result;
};
