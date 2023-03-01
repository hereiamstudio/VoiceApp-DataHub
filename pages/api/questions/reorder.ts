import type {NextApiRequest, NextApiResponse} from 'next';
import {captureException, withSentry} from '@sentry/nextjs';
import strings from '@/locales/api/en.json';
import {firebaseDB as db} from '@/utils/firebase/admin';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const interviewId = req.query?.interviewId?.toString();
        const projectId = req.query?.projectId?.toString();
        const {questionsOrder} = req.body;

        // We'll be updated both the question document and the public document for the question
        // so we'll need to write these in a batch.
        const batch = db().batch();

        // We'll need to update each question individually to update its order.
        questionsOrder.map((questionId, index) => {
            // Questions are increased in hundreds to prevent any ordering issues
            // when probing questions are added during an interview.
            const questionOrder = index + 1; // 100;
            const questionData = {order: questionOrder};
            const questionRef = db()
                .collection('projects')
                .doc(projectId)
                .collection('interviews')
                .doc(interviewId)
                .collection('questions')
                .doc(questionId);
            const questionPublicRef = db()
                .collection('projects')
                .doc(projectId)
                .collection('interviews')
                .doc(interviewId)
                .collection('questions')
                .doc(questionId)
                .collection('questions_public')
                .doc(questionId);

            // Update all the data for the interview.
            batch.update(questionRef, questionData);

            // Update only the limited data require for the App to the public doc.
            batch.update(questionPublicRef, questionData);
        });

        // Write both documents in the batch and then we're done.
        await batch.commit();

        // Send back the merged data after it has been saved.
        res.status(200).json({id: projectId});
    } catch (error) {
        captureException(error);
        res.status(500).json({
            code: 'firebase_questions_update_error',
            message: strings.errors.firebase_questions_update_error,
            error: error.message
        });
    }
};

export const config = {api: {externalResolver: true}};

export default withSentry(handler);
