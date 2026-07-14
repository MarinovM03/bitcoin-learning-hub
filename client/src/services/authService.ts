import * as request from '../utils/requester';
import type { AuthUser } from '../types';
import { API_BASE_URL } from '../lib/apiConfig';

const baseUrl = `${API_BASE_URL}/users`;

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
    confirmPassword?: string;
    currentPassword?: string;
}

export const login = (identifier: string, password: string): Promise<AuthUser> =>
    request.post<AuthUser>(`${baseUrl}/login`, { identifier, password });

export const register = (registerData: RegisterData): Promise<AuthUser> =>
    request.post<AuthUser>(`${baseUrl}/register`, registerData);

export const logout = async (): Promise<void> => {
    await request.post<unknown>(`${baseUrl}/logout`);
};

export interface AuthMessageResponse {
    message: string;
}

export const forgotPassword = (email: string): Promise<AuthMessageResponse> =>
    request.post<AuthMessageResponse>(`${baseUrl}/forgot-password`, { email });

export const resetPassword = (
    token: string,
    password: string,
    confirmPassword: string,
): Promise<AuthMessageResponse> =>
    request.post<AuthMessageResponse>(`${baseUrl}/reset-password`, { token, password, confirmPassword });

export const updateProfile = (data: ProfileUpdateData): Promise<AuthUser> =>
    request.put<AuthUser>(`${baseUrl}/profile`, data);

export const deleteAccount = (password: string): Promise<AuthMessageResponse> =>
    request.del<AuthMessageResponse>(`${baseUrl}/me`, { password });

export const getProfile = (): Promise<AuthUser> =>
    request.get<AuthUser>(`${baseUrl}/profile`);
