import * as request from "../utils/requester";

const baseUrl = `${import.meta.env.VITE_API_URL}/articles`;

export const getAll = async () => {
    const result = await request.get(baseUrl);
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

export const getLatest = async (limit = 3) => {
    const result = await request.get(`${baseUrl}?limit=${limit}&sort=latest`);
    return result;
};