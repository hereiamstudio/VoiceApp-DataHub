import type {NextApiRequest, NextApiResponse} from 'next';
import {captureException, withSentry} from '@sentry/nextjs';
import strings from '@/locales/api/en.json';
import {firebaseDB as db} from '@/utils/firebase/admin';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const projectId = req.query?.projectId?.toString();
        let usersAssignedToProject = [];

        if (projectId) {
            const projectRef = await db().collection('projects').doc(projectId).get();
            const projectData = projectRef.data();

            if (projectData?.assigned_users_ids) {
                usersAssignedToProject = projectData.assigned_users_ids;
            }
        }

        const usersRef = db().collection('users');
        const snaphshot = await usersRef
            .where('is_archived', '==', false)
            .where('is_available_for_projects', '==', true)
            .orderBy('first_name', 'asc')
            .orderBy('last_name', 'asc')
            .get();

        const data = snaphshot.docs
            .filter(doc =>
                usersAssignedToProject.length > 0 ? usersAssignedToProject.includes(doc.id) : true
            )
            .map(doc => {
                const docData = doc.data();

                return {
                    id: doc.id,
                    first_name: docData.first_name,
                    last_name: docData.last_name,
                    company_name: docData.company_name,
                    country: docData.country
                };
            });

        res.status(200).json(data);
    } catch (error) {
        captureException(error);
        res.status(500).json({
            code: 'firebase_users_available_for_projects_fetch_error',
            message: strings.errors.firebase_users_available_for_projects_fetch_error,
            error: error.message
        });
    }
};

export const config = {api: {externalResolver: true}};

export default withSentry(handler);
