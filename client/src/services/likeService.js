import * as request from '../utils/requester';

const baseUrl = `${import.meta.env.VITE_API_URL}/likes`;

export const like = async (articleId) => {
    return request.post(baseUrl, { articleId });
};

export const getAllForArticle = async (articleId) => {
    try {
        const result = await request.get(`${baseUrl}/${articleId}`);
        return result;
    } catch (err) {
        return [];
    }
};