import type {NextApiRequest, NextApiResponse} from 'next';
import {captureException, withSentry} from '@sentry/nextjs';
import {unstable_getServerSession as getServerSession} from 'next-auth/next';
import {authOptions} from 'pages/api/auth/[...nextauth]';
import pick from 'lodash/pick';
import strings from '@/locales/api/en.json';
import {ActivityAction, ActivityType} from '@/types/activity';
import {firebaseDB as db, createdBy} from '@/utils/firebase/admin';
import {getIp} from '@/utils/helpers';

export const PROJECT_PUBLIC_FIELDS = [
    'title',
    'description',
    'interviews_count',
    'assigned_users_ids',
    'is_active',
    'is_archived',
    'created_at'
];

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const session = await getServerSession(req, res, authOptions);
        // Add the new document to the projects collection.
        const data = req.body;
        const projectData = {
            title: data.title,
            description: data.description,
            location: {
                country: data.location_country,
                region: data.location_region
            },
            is_active: data.is_active,
            assigned_users: [
                {
                    first_name: session.user.first_name,
                    id: session.user.uid,
                    last_name: session.user.last_name
                }
            ],
            assigned_users_ids: [session.user.uid],
            interviews_count: 0,
            is_archived: false,
            ...createdBy(session.user)
        };

        // We'll be updated both the project document and the public document for the project
        // so we'll need to write these in a batch.
        const batch = db().batch();

        // Create a doc ID to use in the batch writes.
        const newProjectRef = db().collection('projects').doc();

        // Create the document for the public version of the project.
        const newProjectPublicRef = db()
            .collection('projects')
            .doc(newProjectRef.id)
            .collection('projects_public')
            .doc(newProjectRef.id);

        // Prime the connection
        newProjectRef.get();
        newProjectPublicRef.get();

        // Save all the data for the project.
        batch.set(newProjectRef, projectData);

        // Save only the limited data required for the App to the public doc.
        batch.set(newProjectPublicRef, pick(projectData, PROJECT_PUBLIC_FIELDS));

        // Write both documents in the batch and then we're done.
        await batch.commit();

        // Save audit activity
        await db()
            .collection('activities')
            .add({
                action: ActivityAction.ADD_PROJECT,
                info: {project_id: newProjectPublicRef.id},
                ip: getIp(req),
                type: ActivityType.PROJECT,
                ...createdBy(session.user)
            });

        res.status(200).json({id: newProjectRef.id});
    } catch (error) {
        captureException(error);
        res.status(500).json({
            code: 'firebase_projects_create_error',
            message: strings.errors.firebase_projects_create_error,
            error: error.message
        });
    }
};

export const config = {api: {externalResolver: true}};

export default withSentry(handler);
