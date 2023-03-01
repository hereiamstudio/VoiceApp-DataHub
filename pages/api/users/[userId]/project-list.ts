import type {NextApiRequest, NextApiResponse} from 'next';
import {captureException, withSentry} from '@sentry/nextjs';
import strings from '@/locales/api/en.json';
import {firebaseDB as db} from '@/utils/firebase/admin';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const userId = req.query?.userId?.toString();
        const usersRef = db()
            .collectionGroup('interviews_public')
            .where('assigned_users_ids', 'array-contains', userId)
            .orderBy('created_at', 'desc');
        const snapshot = await usersRef.get();
        const data = snapshot.docs.map(doc => {
            const data = doc.data();

            return {
                id: doc.id,
                is_archived: data.is_archived,
                project: data.project,
                status: data.status,
                title: data.title
            };
        });
        const projects = {};

        if (data.length > 0) {
            data.forEach(item => {
                const key = item.project.title;

                if (!projects[key]) {
                    projects[key] = {
                        project: item.project,
                        interviews: []
                    };

                    delete item.project;
                }

                projects[key].interviews.push(item);
            });
        }

        res.status(200).json(projects);
    } catch (error) {
        captureException(error);
        res.status(500).json({
            code: 'firebase_users_fetch_error',
            message: strings.errors.firebase_users_fetch_error,
            error: error.message
        });
    }
};

export const config = {api: {externalResolver: true}};

export default withSentry(handler);
