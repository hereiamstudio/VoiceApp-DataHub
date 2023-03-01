import type {NextApiRequest, NextApiResponse} from 'next';
import {captureException, withSentry} from '@sentry/nextjs';
import strings from '@/locales/api/en.json';
import {getDateFromTimestamp} from '@/utils/helpers';
import {firebaseDB as db} from '@/utils/firebase/admin';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const invitesRef = db().collection('invites');
        const limit = parseInt(req?.query?.limit?.toString() || '100');
        const offset = parseInt(req?.query?.offset?.toString() || '0');
        const snapshot = await invitesRef
            .where('status', '==', 'invited')
            .limit(limit)
            .offset(offset)
            .orderBy('created_at', 'desc')
            .get();

        const data = snapshot.docs.map(doc => {
            const docData = doc.data();

            return {
                id: doc.id,
                data: {
                    first_name: docData.user.first_name,
                    last_name: docData.user.last_name,
                    invited_by: `${docData.created_by.first_name} ${docData.created_by.last_name}`,
                    role: docData.user.role,
                    company_name: docData.user.company_name,
                    country: docData.user.country,
                    created_at: getDateFromTimestamp(docData.created_at)
                }
            };
        });

        res.status(200).json(data);
    } catch (error) {
        captureException(error);
        res.status(500).json({
            code: 'firebase_invites_fetch_error',
            message: strings.errors.firebase_invites_fetch_error,
            error: error.message
        });
    }
};

export const config = {api: {externalResolver: true}};

export default withSentry(handler);
