import * as request from '../utils/requester';

const baseUrl = `${import.meta.env.VITE_API_URL}/glossary`;

export const getAll = async () => {
    const result = await request.get(baseUrl);
    return result;
};

export const getOne = async (termId) => {
    const result = await request.get(`${baseUrl}/${termId}`);
    return result;
};

export const create = async (data) => {
    const result = await request.post(baseUrl, data);
    return result;
};

export const remove = async (termId) => {
    const result = await request.del(`${baseUrl}/${termId}`);
    return result;
};