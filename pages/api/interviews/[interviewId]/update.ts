import type {NextApiRequest, NextApiResponse} from 'next';
import {captureException, withSentry} from '@sentry/nextjs';
import {unstable_getServerSession as getServerSession} from 'next-auth/next';
import {authOptions} from 'pages/api/auth/[...nextauth]';
import pick from 'lodash/pick';
import strings from '@/locales/api/en.json';
import {ActivityAction, ActivityType} from '@/types/activity';
import {createdBy, firebaseDB as db, updatedBy} from '@/utils/firebase/admin';
import {getIp} from '@/utils/helpers';
import {INTERVIEW_PUBLIC_FIELDS} from '../create';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const session = await getServerSession(req, res, authOptions);
        const interviewId = req.query?.interviewId?.toString();
        const projectId = req.query?.projectId?.toString();
        const interviewData = {
            ...req.body,
            ...updatedBy(session.user)
        };

        if (interviewData.assigned_users?.length > 0) {
            // We use additional data when presenting the users in the UI, but
            // we only store minimal data in the document. Let's shave off the surplous
            // data before saving.
            interviewData.assigned_users = interviewData.assigned_users.map(user => {
                return {
                    id: user.id,
                    first_name: user.first_name,
                    last_name: user.last_name
                };
            });

            // We also have to store an array of just IDs so that we can easily query
            // them when filtering interviews available to users on the App.
            interviewData.assigned_users_ids = interviewData.assigned_users.map(u => u.id);
        }

        // We'll be updated both the interview document and the public document for the interview
        // so we'll need to write these in a batch.
        const batch = db().batch();
        const interviewRef = db()
            .collection('projects')
            .doc(projectId)
            .collection('interviews')
            .doc(interviewId);
        const interviewPublicRef = db()
            .collection('projects')
            .doc(projectId)
            .collection('interviews')
            .doc(interviewId)
            .collection('interviews_public')
            .doc(interviewId);

        // Update all the data for the interview.
        batch.update(interviewRef, interviewData);

        // Update only the limited data require for the App to the public doc.
        batch.update(interviewPublicRef, pick(interviewData, INTERVIEW_PUBLIC_FIELDS));

        // Write both documents in the batch and then we're done.
        await batch.commit();

        // Save audit activity
        await db()
            .collection('activities')
            .add({
                action: ActivityAction.EDIT_INTERVIEW,
                info: {project_id: projectId, interview_id: interviewId},
                ip: getIp(req),
                type: ActivityType.INTERVIEW,
                ...createdBy(session.user)
            });

        // Send back the merged data after it has been saved.
        res.status(200).json({id: interviewId});
    } catch (error) {
        captureException(error);
        res.status(500).json({
            code: 'firebase_interviews_update_error',
            message: strings.errors.firebase_interviews_update_error,
            error: error.message
        });
    }
};

export const config = {api: {externalResolver: true}};

export default withSentry(handler);
