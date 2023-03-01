import type {NextApiRequest, NextApiResponse} from 'next';
import {captureException, captureMessage, withSentry} from '@sentry/nextjs';
import {unstable_getServerSession as getServerSession} from 'next-auth/next';
import {authOptions} from 'pages/api/auth/[...nextauth]';
import strings from '@/locales/api/en.json';
import {firebaseDB as db} from '@/utils/firebase/admin';
import {getDateFromTimestamp} from '@/utils/helpers';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const session = await getServerSession(req, res, authOptions);
        const projectsRef = db().collection('projects');
        const filters = {is_archived: req?.query?.is_archived === 'true'};
        const sort = req?.query?.sort?.toString()?.split(',') || ['updated_at', 'desc'];
        const limit = parseInt(req?.query?.limit?.toString() || '100');
        const offset = parseInt(req?.query?.offset?.toString() || '0');
        let snapshotQuery = projectsRef.where('is_archived', '==', filters.is_archived);

        // Administrators can view all content. Otherwise, we also need to
        // check if the authenticated user is assigned to this project.
        if (session.user.role !== 'administrator') {
            snapshotQuery = snapshotQuery.where(
                'assigned_users_ids',
                'array-contains',
                session.user.uid
            );
        }

        const snaphshot = await snapshotQuery
            .orderBy(sort[0], sort[1] as 'asc' | 'desc')
            .limit(limit)
            .offset(offset)
            .get();
        const data = snaphshot.docs.map(doc => {
            const docData = doc.data();

            return {
                id: doc.id,
                data: {
                    title: docData.title,
                    interviews_count: docData.interviews_count,
                    country: docData.location.country,
                    users_count: docData.assigned_users_ids.length,
                    is_active: docData.is_active,
                    updated_at: docData.updated_at
                        ? getDateFromTimestamp(docData.updated_at)
                        : getDateFromTimestamp(docData.created_at),
                    updated_by: docData.updated_by
                        ? docData.updated_by.first_name
                        : docData.created_by.first_name
                }
            };
        });

        res.status(200).json(data);
    } catch (error) {
        captureException(error);
        res.status(500).json({
            code: 'firebase_projects_all_fetch_error',
            message: strings.errors.firebase_projects_all_fetch_error,
            error: error.message
        });
    }
};

export const config = {api: {externalResolver: true}};

export default withSentry(handler);
