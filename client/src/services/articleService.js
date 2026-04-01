import * as request from "../utils/requester";

const baseUrl = `${import.meta.env.VITE_API_URL}/articles`;
const usersUrl = `${import.meta.env.VITE_API_URL}/users`;

export const getAll = async ({ page = 1, limit = 12, sort = 'latest', search = '', category = '', difficulty = '' } = {}) => {
    const params = new URLSearchParams({ page, limit, sort });
    if (search.trim()) params.set('search', search.trim());
    if (category && category !== 'All') params.set('category', category);
    if (difficulty && difficulty !== 'All') params.set('difficulty', difficulty);

    const result = await request.get(`${baseUrl}?${params.toString()}`);
    return result;
};

export const getMyArticles = async () => {
    const result = await request.get(`${baseUrl}/my`);
    return result;
};

export const getOne = async (articleId) => {
    const result = await request.get(`${baseUrl}/${articleId}`);
    return result;
};

export const getRelated = async (articleId) => {
    const result = await request.get(`${baseUrl}/${articleId}/related`);
    return result;
};

export const getPublicProfile = async (userId) => {
    const result = await request.get(`${usersUrl}/${userId}/public`);
    return result;
};

export const create = async (data) => {
    const result = await request.post(baseUrl, data);
    return result;
};

export const remove = async (articleId) => {
    const result = await request.del(`${baseUrl}/${articleId}`);
    return result;
};

export const edit = async (articleId, data) => {
    const result = await request.put(`${baseUrl}/${articleId}`, data);
    return result;
};

export const getTrending = async () => {
    const result = await request.get(`${baseUrl}/trending`);
    return result;
};