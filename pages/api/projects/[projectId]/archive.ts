import type {NextApiRequest, NextApiResponse} from 'next';
import {captureException, withSentry} from '@sentry/nextjs';
import {unstable_getServerSession as getServerSession} from 'next-auth/next';
import {authOptions} from 'pages/api/auth/[...nextauth]';
import pick from 'lodash/pick';
import strings from '@/locales/api/en.json';
import {ActivityAction, ActivityType} from '@/types/activity';
import {createdBy, firebaseDB as db, updatedBy} from '@/utils/firebase/admin';
import {getIp} from '@/utils/helpers';
import {PROJECT_PUBLIC_FIELDS} from '../create';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const session = await getServerSession(req, res, authOptions);
        const projectId = req.query?.projectId?.toString();
        const projectData = {
            assigned_users: [],
            assigned_users_ids: [],
            is_active: false,
            is_archived: req.body.is_archived,
            ...updatedBy(session.user)
        };

        // We'll be updated both the project document and the public document for the project
        // so we'll need to write these in a batch.
        const batch = db().batch();
        const projectRef = db().collection('projects').doc(projectId);
        const projectPublicRef = db()
            .collection('projects')
            .doc(projectId)
            .collection('projects_public')
            .doc(projectId);

        // Update all the data for the project.
        batch.update(projectRef, projectData);

        // Update only the limited data require for the App to the public doc.
        batch.update(projectPublicRef, pick(projectData, PROJECT_PUBLIC_FIELDS));

        // Write both documents in the batch and then we're done.
        await batch.commit();

        // Save audit activity
        await db()
            .collection('activities')
            .add({
                action: req.body.is_archived
                    ? ActivityAction.ARCHIVE_PROJECT
                    : ActivityAction.RESTORE_PROJECT,
                info: {project_id: projectId},
                ip: getIp(req),
                type: ActivityType.PROJECT,
                ...createdBy(session.user)
            });

        // Send back the merged data after it has been saved.
        res.status(200).json({id: projectId});
    } catch (error) {
        captureException(error);
        res.status(500).json({
            code: 'firebase_projects_archive_error',
            message: strings.errors.firebase_projects_archive_error,
            error: error.message
        });
    }
};

export const config = {api: {externalResolver: true}};

export default withSentry(handler);
