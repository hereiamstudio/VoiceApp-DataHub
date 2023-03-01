import type {ActionUser} from '@/types/user';
import {Timestamp} from './firebase';

export interface Project {
    assigned_users: ActionUser[] | string[];
    assigned_users_ids: string[];
    created_at: Timestamp | any;
    created_by: ActionUser;
    description: string;
    interviews_count: number;
    id?: string;
    is_active: boolean;
    is_archived: boolean;
    location: {
        country: string;
        region: string;
    };
    title: string;
    updated_at?: Timestamp | any;
    updated_by?: ActionUser;
}
