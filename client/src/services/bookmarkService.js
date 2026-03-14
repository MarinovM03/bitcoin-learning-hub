import * as request from '../utils/requester';

const baseUrl = `${import.meta.env.VITE_API_URL}/bookmarks`;

export const toggle = async (articleId) => {
    const result = await request.post(baseUrl, { articleId });
    return result;
};

export const getMyBookmarks = async () => {
    const result = await request.get(baseUrl);
    return result;
};