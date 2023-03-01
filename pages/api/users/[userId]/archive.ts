import type {NextApiRequest, NextApiResponse} from 'next';
import {captureException, withSentry} from '@sentry/nextjs';
import {unstable_getServerSession as getServerSession} from 'next-auth/next';
import {authOptions} from 'pages/api/auth/[...nextauth]';
import strings from '@/locales/api/en.json';
import {ActivityAction, ActivityType} from '@/types/activity';
import {
    createdBy,
    firebaseAdmin as admin,
    firebaseDB as db,
    updatedBy
} from '@/utils/firebase/admin';
import {getIp} from '@/utils/helpers';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const session = await getServerSession(req, res, authOptions);
        const userId = req.query?.userId?.toString();
        const data = req.body;
        const usersRef = db().collection('users');

        // First we need to disable the user from the authentication service.
        await admin().updateUser(userId, {disabled: data.is_archived});

        // Retreive the existing data as our baseline data for the update.
        const existingData = await usersRef.doc(userId).get();

        // Merge the existing and current data for
        const newData = {...existingData.data(), ...data};

        await usersRef.doc(userId).update({
            ...data,
            ...updatedBy(session.user)
        });

        // Save audit activity
        await db()
            .collection('activities')
            .add({
                action: req.body.is_archived
                    ? ActivityAction.ARCHIVE_USER
                    : ActivityAction.RESTORE_USER,
                info: {
                    is_archived: newData.is_archived,
                    user_id: userId
                },
                ip: getIp(req),
                type: ActivityType.USER,
                ...createdBy(session.user)
            });

        // Send back the merged data after it has been saved.
        res.status(200).json({id: userId, data: newData});
    } catch (error) {
        captureException(error);

        if (req.body?.is_archived) {
            res.status(500).json({
                code: 'firebase_users_archive_error',
                message: strings.errors.firebase_users_archive_error,
                error: error.message
            });
        } else {
            res.status(500).json({
                code: 'firebase_users_restore_error',
                message: strings.errors.firebase_users_restore_error,
                error: error.message
            });
        }
    }
};

export const config = {api: {externalResolver: true}};

export default withSentry(handler);
