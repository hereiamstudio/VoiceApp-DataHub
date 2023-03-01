import type {NextApiRequest, NextApiResponse} from 'next';
import {captureException, withSentry} from '@sentry/nextjs';
import strings from '@/locales/api/en.json';
import {firebaseDB as db} from '@/utils/firebase/admin';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const interviewId = req.query?.interviewId?.toString();
        const minimal = req.query?.minimal?.toString();
        const projectId = req.query?.projectId?.toString();
        const interviewsRef = db().collection('projects').doc(projectId).collection('interviews');

        const doc = await interviewsRef.doc(interviewId).get();

        if (!doc.exists) {
            res.status(404).json({
                code: 'firebase_interviews_not_found',
                message: strings.errors.firebase_interviews_not_found
            });
        } else {
            const docData = doc.data();

            // Minimal information is required for certain views, so we don't have to return
            // all of the information.
            if (minimal === 'true') {
                res.status(200).json({
                    id: doc.id,
                    title: docData.title,
                    status: docData.status,
                    primary_language: docData.primary_language,
                    project: docData.project
                });
            } else {
                res.status(200).json({
                    id: doc.id,
                    data: docData
                });
            }
        }
    } catch (error) {
        captureException(error);
        res.status(500).json({
            code: 'firebase_interviews_fetch_error',
            message: strings.errors.firebase_interviews_fetch_error,
            error: error.message
        });
    }
};

export const config = {api: {externalResolver: true}};

export default withSentry(handler);
