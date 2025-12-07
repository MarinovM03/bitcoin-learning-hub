import * as request from '../utils/requester';

const baseUrl = 'http://localhost:3030/data/likes';

export const like = async (articleId) => {
    return request.post(baseUrl, { articleId });
};

export const getAllForArticle = async (articleId) => {
    const query = new URLSearchParams({
        where: `articleId="${articleId}"`,
    });

    try {
        const result = await request.get(`${baseUrl}?${query}`);

        return result;
    } catch (err) {
        return [];
    }
};