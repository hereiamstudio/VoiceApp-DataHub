import type {NextApiRequest, NextApiResponse} from 'next';
import {captureException, withSentry} from '@sentry/nextjs';
import strings from '@/locales/api/en.json';
import {firebaseDB as db} from '@/utils/firebase/admin';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const userId = req.query?.userId?.toString();
        const usersRef = db().collection('users');
        const doc = await usersRef.doc(userId).get();

        if (!doc.exists) {
            res.status(404).json({
                code: 'firebase_users_not_found',
                message: strings.errors.firebase_users_not_found
            });
        } else {
            res.status(200).json({
                id: doc.id,
                data: doc.data()
            });
        }
    } catch (error) {
        captureException(error);
        res.status(500).json({
            code: 'firebase_users_fetch_error',
            message: strings.errors.firebase_users_fetch_error,
            error: error.message
        });
    }
};

export const config = {api: {externalResolver: true}};

export default withSentry(handler);
