import type {NextApiRequest, NextApiResponse} from 'next';
import {captureException, withSentry} from '@sentry/nextjs';
import strings from '@/locales/api/en.json';
import {ActivityType} from '@/types/activity';
import {firebaseDB as db} from '@/utils/firebase/admin';
import {getDateFromTimestamp} from '@/utils/helpers';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const filters = {
            type: req?.query?.type,
            userId: req?.query?.userId?.toString()
        };
        const limit = parseInt(req?.query?.limit?.toString() || '100');
        const offset = parseInt(req?.query?.offset?.toString() || '0');
        const activitiesRef = db().collection('activities');
        let query = activitiesRef;

        if (filters.type && filters.type !== 'any') {
            // @ts-ignore
            query = query.where('type', '==', filters.type);
        } else {
            // @ts-ignore
            query = query.where(
                'type',
                'in',
                Object.values(ActivityType).filter(i => i !== 'System')
            );
        }

        if (filters.userId) {
            // @ts-ignore
            query = query.where('created_by.id', '==', filters.userId);
        }

        const snaphshot = await query
            .orderBy('created_at', 'desc')
            .limit(limit)
            .offset(offset)
            .get();

        const data = snaphshot.docs.map(doc => {
            const docData = doc.data();

            return {
                id: doc.id,
                data: {
                    ...docData,
                    created_at: getDateFromTimestamp(docData.created_at)
                }
            };
        });

        res.status(200).json(data);
    } catch (error) {
        captureException(error);
        res.status(500).json({
            code: 'firebase_users_all_fetch_error',
            message: strings.errors.firebase_users_all_fetch_error,
            error: error.message
        });
    }
};

export const config = {api: {externalResolver: true}};

export default withSentry(handler);
