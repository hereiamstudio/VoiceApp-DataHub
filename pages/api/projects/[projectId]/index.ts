import type {NextApiRequest, NextApiResponse} from 'next';
import {captureException, withSentry} from '@sentry/nextjs';
import strings from '@/locales/api/en.json';
import {firebaseDB as db} from '@/utils/firebase/admin';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const minimal = req.query?.minimal?.toString();
        const projectId = req.query?.projectId?.toString();
        const projectsRef = db().collection('projects');
        const doc = await projectsRef.doc(projectId).get();

        if (!doc.exists) {
            res.status(404).json({
                code: 'firebase_projects_not_found',
                message: strings.errors.firebase_projects_not_found
            });
        } else {
            const docData = doc.data();

            // Minimal information is required for certain views, so we don't have to return
            // all of the information.
            if (minimal) {
                res.status(200).json({
                    id: doc.id,
                    title: docData.title
                });
            } else {
                res.status(200).json({
                    id: doc.id,
                    data: {
                        ...docData,
                        location_country: docData.location.country,
                        location_region: docData.location.region
                    }
                });
            }
        }
    } catch (error) {
        captureException(error);
        res.status(500).json({
            code: 'firebase_projects_fetch_error',
            message: strings.errors.firebase_projects_fetch_error,
            error: error.message
        });
    }
};

export const config = {api: {externalResolver: true}};

export default withSentry(handler);
