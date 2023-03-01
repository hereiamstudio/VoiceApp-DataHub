export interface MetaData {
    creationTime?: string;
    lastSignInTime?: string;
}

export interface ProviderData {
    uid?: string;
    email?: string;
    providerId?: string;
}

export interface AuthUser {
    disabled?: boolean;
    email?: string;
    email_verified?: string;
    initializing: boolean;
    isLoggedIn: boolean;
    metadata?: MetaData;
    providerData?: ProviderData;
    tokensValidAfterTime?: string;
    uid?: string;
}

export interface FirebaseTimestamp {
    _seconds: number;
    _nanoseconds: number;
}

export type Timestamp = FirebaseTimestamp | number | string;
