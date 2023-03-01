import type {NextApiRequest, NextApiResponse} from 'next';
import {captureException, withSentry} from '@sentry/nextjs';
import {unstable_getServerSession as getServerSession} from 'next-auth/next';
import {authOptions} from 'pages/api/auth/[...nextauth]';
import pick from 'lodash/pick';
import strings from '@/locales/api/en.json';
import {ActivityAction, ActivityType} from '@/types/activity';
import {createdBy, firebaseAdmin as admin, firebaseDB as db} from '@/utils/firebase/admin';
import {getIp} from '@/utils/helpers';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const session = await getServerSession(req, res, authOptions);
        const userId = req.query?.userId?.toString();

        // Ensure the current auth user is allowed to update the account.
        // Admins can update any account.
        if (session.user !== 'administrator' && session.user.uid !== userId) {
            return res.status(403).json({
                code: 'firebase_role_forbidden',
                message: strings.errors.firebase_role_forbidden
            });
        }

        // Remove all fields that are not allowed to be updated.
        const newAccountData = pick(req.body, [
            'company_name',
            'country',
            'email',
            'first_name',
            'last_name',
            'role'
        ]);
        const newPassword = req.body?.password;

        // Retreive the existing data to clarify if we need to perform any
        // Authentication service updates also.
        const usersRef = db().collection('users').doc(userId);
        const currentAccount: any = await usersRef.get();
        const currentAccountData = currentAccount.data();

        // If the email has changed, we need to update the Authentication user also.
        // If they have sent a password it's because an update is expected.
        if (currentAccountData.email !== newAccountData.email || newPassword) {
            let updatedAuthData: {
                email: string;
                password?: string;
            } = {email: newAccountData.email};

            if (newPassword) {
                updatedAuthData = {
                    ...updatedAuthData,
                    password: newPassword
                };
            }

            await admin().updateUser(userId, updatedAuthData);
        }

        // If the role has changed, we need to update the Authentication user's claim also.
        if (currentAccountData.role !== newAccountData.role) {
            await admin().setCustomUserClaims(userId, {
                role: newAccountData.role
            });
        }

        await usersRef.update(newAccountData);
        await db()
            .collection('activities')
            .add({
                action: ActivityAction.EDIT_USER,
                info: {user_id: userId},
                ip: getIp(req),
                type: ActivityType.USER,
                ...createdBy(session.user)
            });

        return res.status(200).json(newAccountData);
    } catch (error) {
        captureException(error);
        res.status(500).json({
            code: 'firebase_account_update_error',
            message: strings.errors.firebase_account_update_error,
            error: error.message
        });
    }
};

export const config = {api: {externalResolver: true}};

export default withSentry(handler);
