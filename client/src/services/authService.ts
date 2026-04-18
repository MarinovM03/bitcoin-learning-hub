import * as request from '../utils/requester';
import type { AuthUser } from '../types';

const baseUrl = `${import.meta.env.VITE_API_URL}/users`;

export interface RegisterData {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface ProfileUpdateData {
    username?: string;
    email?: string;
    profilePicture?: string;
    password?: string;
}

export const login = (identifier: string, password: string): Promise<AuthUser> =>
    request.post<AuthUser>(`${baseUrl}/login`, { identifier, password });

export const register = (registerData: RegisterData): Promise<AuthUser> =>
    request.post<AuthUser>(`${baseUrl}/register`, registerData);

export const logout = async (): Promise<void> => {
    await request.post<unknown>(`${baseUrl}/logout`);
};

export const updateProfile = (data: ProfileUpdateData): Promise<AuthUser> =>
    request.put<AuthUser>(`${baseUrl}/profile`, data);

export const getProfile = (): Promise<AuthUser> =>
    request.get<AuthUser>(`${baseUrl}/profile`);
