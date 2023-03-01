import {NextApiRequest} from 'next';
import type {User} from '@/types/user';

export interface NextApiRequestWithMiddleware extends NextApiRequest {
    session: {
        active?: number;
        createdAt: number;
        refreshToken: string;
        user: Partial<User>;
        updatedAt?: number;
        userToken: string;
    };
}
