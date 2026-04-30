export type UserRole = 'user' | 'admin';

export interface User {
    _id: string;
    username: string;
    email: string;
    profilePicture?: string;
    usernameChangedAt: string | null;
    role?: UserRole;
}

export interface AuthUser extends User {
    accessToken: string;
}
