import type {NextApiRequest, NextApiResponse} from 'next';
import {captureException, withSentry} from '@sentry/nextjs';
import {unstable_getServerSession as getServerSession} from 'next-auth/next';
import {authOptions} from 'pages/api/auth/[...nextauth]';
import pick from 'lodash/pick';
import strings from '@/locales/api/en.json';
import {ActivityAction, ActivityType} from '@/types/activity';
import {createdBy, firebaseDB as db, updatedBy} from '@/utils/firebase/admin';
import {getIp} from '@/utils/helpers';

const QUESTION_PUBLIC_FIELDS = [
    'title',
    'description',
    'interview',
    'project',
    'options',
    'order',
    'type',
    'status',
    'skip_logic',
    'is_active',
    'is_archived'
];

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const session = await getServerSession(req, res, authOptions);
        const interviewId = req.query?.interviewId?.toString();
        const projectId = req.query?.projectId?.toString();
        const batch = db().batch();
        let hasSkipLogic = false;

        Object.keys(req.body.questions).map((questionId, index) => {
            const question = req.body.questions[questionId];
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
            const action = req.body.added.includes(questionId) ? 'create' : 'update';
            const questionData = {
                ...question,
                ...updatedBy(session.user),
                ...(action === 'create'
                    ? {...createdBy(session.user), is_active: true, is_archived: false}
                    : {}),
                interview: req.body.interview,
                order: (index + 1) * 100,
                options: question.type !== 'free_text' ? question?.options || [] : [],
                project: req.body.project,
                skip_logic: question.type !== 'free_text' ? question?.skip_logic || [] : []
            };

            // If the question has skip logic, we need to update the skip logic for the interview.
            if (questionData.skip_logic?.length > 0) {
                hasSkipLogic = true;
            }

            // Update all the data for the interview.
            batch[action](questionRef, questionData);

            // Update only the limited data require for the App to the public doc.
            batch[action](questionPublicRef, pick(questionData, QUESTION_PUBLIC_FIELDS));
        });

        req.body.removed.map(questionId => {
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

            batch.delete(questionRef);
            batch.delete(questionPublicRef);
        });

        const interviewRef = db()
            .collection('projects')
            .doc(projectId)
            .collection('interviews')
            .doc(interviewId);
        const interviewRefPublic = db()
            .collection('projects')
            .doc(projectId)
            .collection('interviews')
            .doc(interviewId)
            .collection('interviews_public')
            .doc(interviewId);

        batch.update(interviewRef, {has_skip_logic: hasSkipLogic});
        batch.update(interviewRefPublic, {has_skip_logic: hasSkipLogic});

        await batch.commit();

        // Save audit activity
        await db()
            .collection('activities')
            .add({
                action: ActivityAction.EDIT_QUESTION,
                info: {
                    project_id: projectId,
                    interview_id: interviewId
                },
                ip: getIp(req),
                type: ActivityType.QUESTION,
                ...createdBy(session.user)
            });

        // Send back the merged data after it has been saved.
        res.status(200).json({success: true});
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
