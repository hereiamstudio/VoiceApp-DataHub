export interface AuthUser {
    email?: string;
    email_verified?: boolean;
    initializing: boolean;
    isLoggedIn: boolean;
}

export interface AuthUserInfo {
    AuthUser: {
        email: string;
        email_verified: boolean;
        id: string;
        role: string;
    };
    token: string;
}
