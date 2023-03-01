import type {NextApiRequest, NextApiResponse} from 'next';
import {captureException, withSentry} from '@sentry/nextjs';
import {unstable_getServerSession as getServerSession} from 'next-auth/next';
import {authOptions} from 'pages/api/auth/[...nextauth]';
import {v4 as uuidv4} from 'uuid';
import {ActivityAction, ActivityType} from '@/types/activity';
import strings from '@/locales/api/en.json';
import {firebaseDB as db, createdBy} from '@/utils/firebase/admin';
import {getIp} from '@/utils/helpers';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const session = await getServerSession(req, res, authOptions);
        // Check for existing invites, only 1 invite per email
        const invite = await db()
            .collection('invites')
            .where('user.email', '==', req.body.email)
            .where('status', '==', 'invited')
            .get();

        if (invite.docs.length) {
            return res.status(500).json({
                code: 'firebase_users_create_invited_error',
                message: strings.errors.firebase_users_create_invited_error
            });
        }

        const token = uuidv4();
        const inviteRef = db().collection('invites').doc(token);

        await inviteRef.set({
            invited_by: session.user.email,
            status: 'invited',
            token,
            user: req.body,
            ...createdBy(session.user)
        });

        // Save audit activity
        await db()
            .collection('activities')
            .add({
                action: ActivityAction.ADD_USER,
                info: {user_email: req.body.email},
                ip: getIp(req),
                type: ActivityType.USER,
                ...createdBy(session.user)
            });

        res.status(200).json({success: true});
    } catch (error) {
        captureException(error);
        res.status(500).json({
            code: 'firebase_users_create_error',
            message: strings.errors.firebase_users_create_error,
            error: error.message
        });
    }
};

export const config = {api: {externalResolver: true}};

export default withSentry(handler);
