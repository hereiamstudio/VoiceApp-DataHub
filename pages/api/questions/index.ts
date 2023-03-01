import type {NextApiRequest, NextApiResponse} from 'next';
import {captureException, withSentry} from '@sentry/nextjs';
import strings from '@/locales/api/en.json';
import {firebaseDB as db} from '@/utils/firebase/admin';
import {getDateFromTimestamp} from '@/utils/helpers';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const interviewId = req.query?.interviewId?.toString();
        const projectId = req.query?.projectId?.toString();
        const filters = {
            is_archived: req?.query?.is_archived === 'true'
        };
        const limit = parseInt(req?.query?.limit?.toString() || '100');
        const offset = parseInt(req?.query?.offset?.toString() || '0');

        const questionsRef = db()
            .collection('projects')
            .doc(projectId)
            .collection('interviews')
            .doc(interviewId)
            .collection('questions');
        const query = questionsRef.where('is_archived', '==', filters.is_archived);
        const snaphshot = await query.orderBy('order', 'asc').limit(limit).offset(offset).get();
        const data = snaphshot.docs.map(doc => {
            const docData = doc.data();

            return {
                id: doc.id,
                data: {
                    ...docData,
                    number: docData.order / 100,
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
            code: 'firebase_questions_all_fetch_error',
            message: strings.errors.firebase_questions_all_fetch_error,
            error: error.message
        });
    }
};

export const config = {api: {externalResolver: true}};

export default withSentry(handler);
