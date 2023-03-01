import type {NextApiRequest, NextApiResponse} from 'next';
import {captureException, withSentry} from '@sentry/nextjs';
import {unstable_getServerSession as getServerSession} from 'next-auth/next';
import {authOptions} from 'pages/api/auth/[...nextauth]';
import omit from 'lodash/omit';
import pick from 'lodash/pick';
import strings from '@/locales/api/en.json';
import {ActivityAction, ActivityType} from '@/types/activity';
import type {Project} from '@/types/project';
import type {User} from '@/types/user';
import {createdBy, firebaseDB as db, updatedBy} from '@/utils/firebase/admin';
import {getIp} from '@/utils/helpers';
import {PROJECT_PUBLIC_FIELDS} from '../create';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const session = await getServerSession(req, res, authOptions);
        const projectId = req.query?.projectId?.toString();
        const projectData: Partial<Project> = {
            ...omit(req.body, ['location_country', 'location_region']),
            ...updatedBy(session.user)
        };

        // If the location is present then we need to transform the single fields to the map.
        // TODO: Formik/Yup had issues with map fields.
        if (req.body.location_country) {
            projectData.location = {
                country: req.body.location_country,
                region: req.body.location_region
            };
        }

        if (projectData.assigned_users?.length > 0) {
            // We use additional data when presenting the users in the UI, but
            // we only store minimal data in the document. Let's shave off the surplous
            // data before saving.
            projectData.assigned_users = projectData.assigned_users.map(
                // @ts-ignore
                (user: Partial<User>) => {
                    return {
                        id: user.id,
                        first_name: user.first_name,
                        last_name: user.last_name
                    };
                }
            );

            // We also have to store an array of just IDs so that we can easily query
            // them when filtering projects available to users on the App.
            // @ts-ignore
            projectData.assigned_users_ids = projectData.assigned_users.map(
                (u: Partial<Project>) => u.id
            );
        }

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
                action: ActivityAction.EDIT_PROJECT,
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
            code: 'firebase_projects_update_error',
            message: strings.errors.firebase_projects_update_error,
            error: error.message
        });
    }
};

export const config = {api: {externalResolver: true}};

export default withSentry(handler);
