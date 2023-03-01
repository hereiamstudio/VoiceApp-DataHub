import type {NextApiRequest, NextApiResponse} from 'next';
import {captureException, withSentry} from '@sentry/nextjs';
import {unstable_getServerSession as getServerSession} from 'next-auth/next';
import {authOptions} from 'pages/api/auth/[...nextauth]';
import omit from 'lodash/omit';
import {ActivityAction, ActivityType} from '@/types/activity';
import strings from '@/locales/api/en.json';
import {firebaseAuth} from '@/utils/firebase';
import {firebaseAdmin as admin, firebaseDB as db, createdBy} from '@/utils/firebase/admin';
import {getIp} from '@/utils/helpers';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const session = await getServerSession(req, res, authOptions);
        const usersRef = db().collection('users');

        // First we need to create the user in the Authentication service.
        const authUser = await firebaseAuth().createUserWithEmailAndPassword(
            req.body.email,
            req.body.password
        );
        const {uid} = authUser.user;

        // After the user is created we must save their role as a claim on their Auth account.
        await admin().setCustomUserClaims(uid, {role: req.body.role});

        // Then we need to add the user to the database where we store more information on them.
        // We use their auth UID as the database doc ID.
        // We also remove the password from the body as we only need that for the Authentication, not DB.
        const data = omit(req.body, 'password');

        await usersRef.doc(uid).set({
            ...data,
            ...createdBy(session.user),
            is_archived: false
        });

        // Save audit activity
        await db()
            .collection('activities')
            .add({
                action: ActivityAction.ADD_USER,
                info: {user_id: uid},
                ip: getIp(req),
                type: ActivityType.USER,
                ...createdBy(session.user)
            });

        // Send back the user's ID only
        res.status(200).json({id: uid});
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
