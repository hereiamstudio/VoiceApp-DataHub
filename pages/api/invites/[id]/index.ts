import type {NextApiRequest, NextApiResponse} from 'next';
import {captureException, withSentry} from '@sentry/nextjs';
import strings from '@/locales/api/en.json';
import {firebaseDB as db} from '@/utils/firebase/admin';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const id = req.query?.id?.toString();
        const invitesRef = db().collection('invites');
        const doc = await invitesRef.doc(id).get();

        if (!doc.exists) {
            res.status(404).json({
                code: 'firebase_invites_not_found',
                message: strings.errors.firebase_invites_not_found
            });
        } else {
            res.status(200).json(doc.data());
        }
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
