import type {NextApiRequest, NextApiResponse} from 'next';
import {captureException, withSentry} from '@sentry/nextjs';
import strings from '@/locales/api/en.json';
import {firebaseDB as db} from '@/utils/firebase/admin';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const templateId = req.query?.templateId?.toString();
        const templatesRef = db().collection('templates');

        const doc = await templatesRef.doc(templateId).get();

        if (!doc.exists) {
            res.status(404).json({
                code: 'firebase_templates_not_found',
                message: strings.errors.firebase_templates_not_found
            });
        } else {
            const docData = doc.data();

            res.status(200).json({
                id: doc.id,
                data: docData
            });
        }
    } catch (error) {
        captureException(error);
        res.status(500).json({
            code: 'firebase_templates_fetch_error',
            message: strings.errors.firebase_templates_fetch_error,
            error: error.message
        });
    }
};

export const config = {api: {externalResolver: true}};

export default withSentry(handler);
