import type {NextApiRequest, NextApiResponse} from 'next';
import {captureException, withSentry} from '@sentry/nextjs';
import strings from '@/locales/api/en.json';
import {firebaseDB as db} from '@/utils/firebase/admin';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const interviewId = req?.query?.interviewId?.toString();
        const questionId = req?.query?.questionId?.toString();

        const limit = parseInt(req?.query?.limit?.toString() || '100');
        const offset = parseInt(req?.query?.offset?.toString() || '0');
        let snapshotQuery = db()
            .collectionGroup('response_answers')
            .where('interview.id', '==', interviewId);

        if (questionId) {
            snapshotQuery = snapshotQuery.where('question.id', '==', questionId);
        }

        const snapshot = await snapshotQuery.limit(limit).offset(offset).get();
        const data = snapshot.docs.map(doc => {
            const docData = doc.data();

            return {
                id: doc.id,
                ...docData
            };
        });

        res.status(200).json(data);
    } catch (error) {
        captureException(error);
        res.status(500).json({
            code: 'firebase_reports_open_responses_fetch_error',
            message: strings.errors.firebase_reports_open_responses_fetch_error,
            error: error.message
        });
    }
};

export const config = {api: {externalResolver: true}};

export default withSentry(handler);
