import omit from 'lodash/omit';
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

const handler = async (req, res) => {
    try {
        const session = await getServerSession(req, res, authOptions);
        const userId = req.query?.userId?.toString();
        const data = req.body;

        // Remove password from body as we only need that for the Authentication, not DB.
        // The profile stores only personal atrributes, not authentication.
        const newProfileData = omit(data, 'password');
        const usersRef = db().collection('users');

        // Retreive the existing data to clarify if we need do perform
        // Authentication service updates also.
        const currentProfileData = await usersRef.doc(userId).get();

        // If the email has changed, we need to update the Authentication user also.
        // If they have sent a password it's because an update is expected.
        // @ts-ignore
        if (currentProfileData.email !== data.email || data.password) {
            let updatedAuthData = {email: data.email};

            if (data.password) {
                updatedAuthData = {
                    ...updatedAuthData,
                    // @ts-ignore
                    password: data.password
                };
            }

            await admin().updateUser(userId, updatedAuthData);
        }

        // If the role has changed, we need to update the Authentication user's claim also.
        // @ts-ignore
        if (currentProfileData.role !== data.role) {
            await admin().setCustomUserClaims(userId, {
                role: data.role
            });
        }

        await usersRef.doc(userId).update({
            ...newProfileData,
            ...updatedBy(session.user)
        });

        // Save audit activity
        await db()
            .collection('activities')
            .add({
                action: ActivityAction.EDIT_USER,
                info: {user_id: userId},
                ip: getIp(req),
                type: ActivityType.USER,
                ...createdBy(session.user)
            });

        // Send back the merged data after it has been saved.
        res.status(200).json({
            id: userId,
            data: {...currentProfileData, ...newProfileData}
        });
    } catch (error) {
        captureException(error);
        res.status(500).json({
            code: 'firebase_users_update_error',
            message: strings.errors.firebase_users_update_error,
            error: error.message
        });
    }
};

export const config = {api: {externalResolver: true}};

export default withSentry(handler);
