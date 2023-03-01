import type {NextApiRequest, NextApiResponse} from 'next';
import {captureException, withSentry} from '@sentry/nextjs';
import strings from '@/locales/api/en.json';
import {firebaseDB as db} from '@/utils/firebase/admin';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const interviewId = req.query?.interviewId?.toString();
        const projectId = req.query?.projectId?.toString();
        const interviewsRef = db().collection('projects').doc(projectId).collection('interviews');

        const doc = await interviewsRef.doc(interviewId).get();
        const questionsRef = db()
            .collection('projects')
            .doc(projectId)
            .collection('interviews')
            .doc(interviewId)
            .collection('questions');
        const questionsSnapshot = await questionsRef.where('is_archived', '==', false).get();

        if (!doc.exists) {
            res.status(404).json({
                code: 'firebase_interviews_not_found',
                message: strings.errors.firebase_interviews_not_found
            });
        } else {
            const docData = doc.data();

            res.status(200).json({
                userSize: docData?.assigned_users?.length || 0,
                consentSize: docData?.consent_step_1?.title
                    ? docData.consent_step_2?.title
                        ? 2
                        : 1
                    : 0,
                questionSize: questionsSnapshot.docs.length,
                responseSize: docData?.responses_count || 0
            });
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
