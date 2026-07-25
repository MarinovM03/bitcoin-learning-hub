export type UserRole = 'user' | 'admin';

export interface User {
    _id: string;
    username: string;
    email: string;
    profilePicture?: string;
    usernameChangedAt: string | null;
    role?: UserRole;
    emailVerified?: boolean;
}

export interface AuthUser extends User {
    expiresAt: number;
}
