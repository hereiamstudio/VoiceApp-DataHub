import type {NextApiRequest, NextApiResponse} from 'next';
import {captureException, withSentry} from '@sentry/nextjs';
import strings from '@/locales/api/en.json';
import {firebaseDB as db} from '@/utils/firebase/admin';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const userId = req.query?.userId?.toString();

    try {
        const usersRef = db().collection('users');

        await usersRef.doc(userId).update({email_verified: true});

        res.status(200).json({success: true});
    } catch (error) {
        captureException(error);
        res.status(500).json({
            code: 'firebase_account_verify_error',
            message: strings.errors.firebase_account_verify_error,
            error: error.message
        });
    }
};

export const config = {api: {externalResolver: true}};

export default withSentry(handler);
