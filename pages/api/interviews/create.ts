import type {NextApiRequest, NextApiResponse} from 'next';
import {captureException, withSentry} from '@sentry/nextjs';
import {unstable_getServerSession as getServerSession} from 'next-auth/next';
import {authOptions} from 'pages/api/auth/[...nextauth]';
import pick from 'lodash/pick';
import strings from '@/locales/api/en.json';
import {ActivityAction, ActivityType} from '@/types/activity';
import {firebaseDB as db, createdBy} from '@/utils/firebase/admin';
import {getIp} from '@/utils/helpers';

export const INTERVIEW_PUBLIC_FIELDS = [
    'assigned_users_ids',
    'consent_step_1',
    'consent_step_2',
    'created_at',
    'description',
    'is_active',
    'is_archived',
    'primary_language',
    'locale',
    'project',
    'status',
    'responses_count',
    'title'
];

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const session = await getServerSession(req, res, authOptions);
        // Add the new document to the projects collection.
        const data = req.body;
        const projectId = req.query?.projectId?.toString();

        if (!projectId) {
            res.status(500).json({
                code: 'firebase_interviews_create_error',
                message: strings.errors.firebase_interviews_create_error
            });
        }

        const consentFields = {
            checklist: '',
            confirmation_question: '',
            confirmation_options: [
                {is_correct: true, label: '', order: 1},
                {is_correct: false, label: '', order: 2},
                {is_correct: false, label: '', order: 3}
            ],
            description: '',
            title: ''
        };
        const interviewData = {
            assigned_users: [
                {
                    first_name: session.user.first_name,
                    id: session.user.uid,
                    last_name: session.user.last_name
                }
            ],
            assigned_users_ids: [session.user.uid],
            consent_step_1: {...consentFields},
            consent_step_2: null,
            description: data.description,
            is_active: data.is_active,
            is_archived: false,
            locale: data.locale,
            primary_language: data.primary_language,
            project: data.project,
            responses_count: 0,
            status: 'draft',
            title: data.title,
            ...createdBy(session.user)
        };

        // We'll be updated both the interview document and the public document for
        // the interview so we'll need to write these in a batch.
        const batch = db().batch();

        // Create a doc ID to use in the batch writes.
        const newInterviewRef = db()
            .collection('projects')
            .doc(projectId)
            .collection('interviews')
            .doc();

        // Create the document for the public version of the interview.
        const newInterviewPublicRef = db()
            .collection('projects')
            .doc(projectId)
            .collection('interviews')
            .doc(newInterviewRef.id)
            .collection('interviews_public')
            .doc(newInterviewRef.id);

        // Save all the data for the interview.
        batch.set(newInterviewRef, interviewData);

        // Save only the limited data required for the App to the public doc.
        batch.set(newInterviewPublicRef, pick(interviewData, INTERVIEW_PUBLIC_FIELDS));

        // Write both documents in the batch and then we're done.
        await batch.commit();

        // Save audit activity
        await db()
            .collection('activities')
            .add({
                action: ActivityAction.ADD_INTERVIEW,
                info: {project_id: projectId, interview_id: newInterviewRef.id},
                ip: getIp(req),
                type: ActivityType.INTERVIEW,
                ...createdBy(session.user)
            });

        res.status(200).json({id: newInterviewRef.id});
    } catch (error) {
        captureException(error);
        res.status(500).json({
            code: 'firebase_interviews_create_error',
            message: strings.errors.firebase_interviews_create_error,
            error: error.message
        });
    }
};

export const config = {api: {externalResolver: true}};

export default withSentry(handler);
