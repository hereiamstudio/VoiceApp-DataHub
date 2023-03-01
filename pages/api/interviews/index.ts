import type {NextApiRequest, NextApiResponse} from 'next';
import {captureException, withSentry} from '@sentry/nextjs';
import {unstable_getServerSession as getServerSession} from 'next-auth/next';
import {authOptions} from 'pages/api/auth/[...nextauth]';
import strings from '@/locales/api/en.json';
import {firebaseDB as db} from '@/utils/firebase/admin';
import {getDateFromTimestamp} from '@/utils/helpers';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const session = await getServerSession(req, res, authOptions);
        const projectId = req.query?.projectId?.toString();
        const interviewsRef = db().collection('projects').doc(projectId).collection('interviews');
        const filters = {
            is_archived: req?.query?.is_archived === 'true',
            status: req?.query?.status
        };
        const limit = parseInt(req?.query?.limit?.toString() || '100');
        const offset = parseInt(req?.query?.offset?.toString() || '0');

        let snapshotQuery = interviewsRef.where('is_archived', '==', filters.is_archived);

        if (filters.status && filters.status !== 'any') {
            snapshotQuery = snapshotQuery.where('status', '==', filters.status);
        }

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
            .orderBy('created_at', 'desc')
            .limit(limit)
            .offset(offset)
            .get();
        const data = snaphshot.docs.map(doc => {
            const docData = doc.data();

            return {
                id: doc.id,
                data: {
                    title: docData.title,
                    primary_language: docData.primary_language,
                    responses_count: docData.responses_count,
                    users_count: docData.assigned_users_ids.length,
                    status: docData.status,
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
            code: 'firebase_templates_all_fetch_error',
            message: strings.errors.firebase_templates_all_fetch_error,
            error: error.message
        });
    }
};

export const config = {api: {externalResolver: true}};

export default withSentry(handler);
