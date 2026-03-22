import * as request from "../utils/requester";

const baseUrl = `${import.meta.env.VITE_API_URL}/articles`;
const usersUrl = `${import.meta.env.VITE_API_URL}/users`;

export const getAll = async ({ page = 1, limit = 12, sort = 'latest' } = {}) => {
    const result = await request.get(`${baseUrl}?page=${page}&limit=${limit}&sort=${sort}`);
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