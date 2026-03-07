import * as request from '../utils/requester';

const baseUrl = 'http://localhost:5000/comments';

export const getAllForArticle = async (articleId) => {
    try {
        const result = await request.get(`${baseUrl}/${articleId}`);
        return result;
    } catch (err) {
        return [];
    }
};

export const create = async (articleId, text) => {
    const result = await request.post(baseUrl, { articleId, text });
    return result;
};

export const remove = async (commentId) => {
    const result = await request.del(`${baseUrl}/${commentId}`);
    return result;
};