import * as request from "../utils/requester";

const baseUrl = 'http://localhost:3030/data/articles';

export const getAll = async () => {
    const result = await request.get(baseUrl);
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