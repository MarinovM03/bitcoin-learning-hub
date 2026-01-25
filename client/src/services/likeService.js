import * as request from '../utils/requester';

const baseUrl = 'http://localhost:5000/likes';

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