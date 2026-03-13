import * as request from "../utils/requester";

const baseUrl = `${import.meta.env.VITE_API_URL}/users`;

export const login = async (identifier, password) => {
    const result = await request.post(`${baseUrl}/login`, { identifier, password });
    return result;
};

export const register = async (registerData) => {
    const result = await request.post(`${baseUrl}/register`, registerData);
    return result;
};

export const logout = async () => {
    await request.post(`${baseUrl}/logout`);
};

export const updateProfile = async (data) => {
    const result = await request.put(`${baseUrl}/profile`, data);
    return result;
};

export const getProfile = async () => {
    const result = await request.get(`${baseUrl}/profile`);
    return result;
};