import * as request from '../utils/requester';

const baseUrl = `${import.meta.env.VITE_API_URL}/paths`;

export const getAll = async ({ page = 1, limit = 12, difficulty = '' } = {}) => {
    const params = new URLSearchParams({ page, limit });
    if (difficulty && difficulty !== 'All') params.set('difficulty', difficulty);
    const result = await request.get(`${baseUrl}?${params.toString()}`);
    return result;
};

export const getMyPaths = async () => {
    const result = await request.get(`${baseUrl}/my`);
    return result;
};

export const getOne = async (pathId) => {
    const result = await request.get(`${baseUrl}/${pathId}`);
    return result;
};

export const create = async (data) => {
    const result = await request.post(baseUrl, data);
    return result;
};

export const edit = async (pathId, data) => {
    const result = await request.put(`${baseUrl}/${pathId}`, data);
    return result;
};

export const remove = async (pathId) => {
    const result = await request.del(`${baseUrl}/${pathId}`);
    return result;
};
