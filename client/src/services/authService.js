import * as request from "../utils/requester";

const baseUrl = 'http://localhost:5000/users';

export const login = async (email, password) => {
    const result = await request.post(`${baseUrl}/login`, {
        email,
        password,
    });

    return result;
};

export const register = async (registerData) => {
    const result = await request.post(`${baseUrl}/register`, registerData);
    
    return result;
};

export const logout = async () => {
    await request.post(`${baseUrl}/logout`);
};