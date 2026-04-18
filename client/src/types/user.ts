export interface User {
    _id: string;
    username: string;
    email: string;
    profilePicture?: string;
    usernameChangedAt: string | null;
}

export interface AuthUser extends User {
    accessToken: string;
}
