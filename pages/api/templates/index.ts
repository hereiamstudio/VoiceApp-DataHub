import type {NextApiRequest, NextApiResponse} from 'next';
import {captureException, withSentry} from '@sentry/nextjs';
import strings from '@/locales/api/en.json';
import {firebaseDB as db} from '@/utils/firebase/admin';
import {getDateFromTimestamp} from '@/utils/helpers';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const templatesRef = db().collection('templates');
        const filters = {
            is_archived: req?.query?.is_archived === 'true',
            language: req?.query?.language,
            type: req?.query?.type
        };

        const limit = parseInt(req?.query?.limit?.toString() || '100');
        const offset = parseInt(req?.query?.offset?.toString() || '0');
        let query = templatesRef.where('is_archived', '==', filters.is_archived);

        if (filters.type !== 'any') {
            query = query.where('type', '==', filters.type);
        }

        if (filters.language) {
            query = query.where('primary_language', '==', filters.language);
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
                    updated_at: docData.updated_at
                        ? getDateFromTimestamp(docData.updated_at)
                        : getDateFromTimestamp(docData.created_at),
                    updated_by: docData.updated_by
                        ? docData.updated_by.first_name
                        : docData.created_by.first_name
                }
            };
        });

        res.status(200).json(data);
    } catch (error) {
        captureException(error);
        res.status(500).json({
            code: 'firebase_templates_all_fetch_error',
            message: strings.errors.firebase_templates_all_fetch_error,
            error: error.message
        });
    }
};

export const config = {api: {externalResolver: true}};

export default withSentry(handler);
