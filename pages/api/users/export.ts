import type {NextApiRequest, NextApiResponse} from 'next';
import {captureException, withSentry} from '@sentry/nextjs';
import {unstable_getServerSession as getServerSession} from 'next-auth/next';
import {authOptions} from 'pages/api/auth/[...nextauth]';
import kebabCase from 'lodash/kebabCase';
import strings from '@/locales/api/en.json';
import {ActivityAction, ActivityType} from '@/types/activity';
import {createdBy, firebaseDB as db} from '@/utils/firebase/admin';
import {getIp} from '@/utils/helpers';
import createExport from './create-export';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const session = await getServerSession(req, res, authOptions);
        const exportType = (req.query?.type?.toString() as 'csv' | 'excel') || 'excel';
        const title = req.query?.title?.toString();
        const filters = {
            exclude: req?.query?.exclude
        };
        const usersRef = db().collection('users');
        const limit = parseInt(req?.query?.limit?.toString() || '100');
        const offset = parseInt(req?.query?.offset?.toString() || '0');
        const snaphshot = await usersRef
            .orderBy('created_at', 'asc')
            .limit(limit)
            .offset(offset)
            .get();
        const data = snaphshot.docs.map(doc => doc.data());

        if (data) {
            const exportData = createExport.getContent(data, filters);
            const exportFile = await createExport.getFile(exportType, exportData);

            res.setHeader(
                'Content-disposition',
                `attachment; filename=${createExport.getFilename(kebabCase(title), exportType)}`
            );
            res.setHeader('Content-Type', 'text/csv;charset=utf-8');

            // Save audit activity
            await db()
                .collection('activities')
                .add({
                    action: ActivityAction.EXPORT_USERS,
                    info: {export_type: exportType},
                    ip: getIp(req),
                    type: ActivityType.USER,
                    ...createdBy(session.user)
                });

            return res.status(200).send(exportFile);
        }

        res.status(200).json({error: 'empty'});
    } catch (error) {
        captureException(error);
        res.status(500).json({
            code: 'firebase_users_export_fetch_error',
            message: strings.errors.firebase_users_export_fetch_error,
            error: error.message
        });
    }
};

export const config = {api: {bodyParser: false, externalResolver: true}};

export default withSentry(handler);
