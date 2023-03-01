import type {Timestamp} from '@/types/firebase';

export enum ExportFields {
    COMPANY_NAME = 'company_name',
    COUNTRY = 'country',
    CREATED_AT = 'created_at',
    EMAIL = 'email',
    FIRST_NAME = 'first_name',
    INVITED_BY = 'invited_by',
    IS_ARCHIVED = 'is_archived',
    IS_AVAILABLE_FOR_PROJECTS = 'is_available_for_projects',
    LAST_ACTIVE = 'last_active',
    LAST_NAME = 'last_name',
    ROLE = 'role',
    UPDATED_AT = 'updated_at'
}

export type ActionUser = {
    first_name: string;
    id: string;
    last_name: string;
};

export type User = {
    active?: number;
    company_name: string;
    country: string;
    created_at: Timestamp;
    created_by: ActionUser;
    email: string;
    email_verified: boolean;
    first_name: string;
    id: string;
    is_archived: boolean;
    is_available_for_projects: boolean;
    last_name: string;
    password?: string;
    role: string;
    uid?: string;
    updated_at: Timestamp;
    updated_by: ActionUser;
};

export type SessionUser = Pick<
    User,
    'active' | 'email' | 'first_name' | 'id' | 'is_archived' | 'last_name' | 'role' | 'uid'
>;

export interface UserInvite {
    created_at: Timestamp;
    created_by: ActionUser;
    email_last_sent?: Timestamp;
    invited_by: string;
    status: 'invited' | 'accepted' | 'revoked';
    token: string;
    user: Partial<User>;
    updated_at: Timestamp;
    updated_by: ActionUser;
}

export type Password = {
    password: string;
};
