import type {NextApiRequest, NextApiResponse} from 'next';
import {captureException, withSentry} from '@sentry/nextjs';
import {ActivityAction, ActivityType} from '@/types/activity';
import strings from '@/locales/api/en.json';
import {firebaseAuth} from '@/utils/firebase';
import {
    firebaseAdmin as admin,
    firebaseDB as db,
    createdBy,
    updatedBy
} from '@/utils/firebase/admin';
import {getIp} from '@/utils/helpers';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const usersRef = db().collection('users');

        // First we need to create the user in the Authentication service.
        const authUser = await firebaseAuth().createUserWithEmailAndPassword(
            req.body.user.email,
            req.body.password
        );
        const {uid} = authUser.user;

        // After the user is created we must save their role as a claim on their Auth account.
        await admin().setCustomUserClaims(uid, {role: req.body.user.role});

        // Then we need to add the user to the database where we store more information on them.
        // We use their auth UID as the database doc ID.
        await usersRef.doc(uid).set({
            ...req.body.user,
            ...createdBy({
                ...req.body.created_by,
                uid: req.body.created_by.id
            }),
            is_archived: false
        });

        // Once we've created the account and saved the user profile we can mark the invite as registered.
        await db()
            .collection('invites')
            .doc(req.body.id)
            .update({
                status: 'accepted',
                user: {
                    role: req.body.user.role,
                    uid
                },
                ...updatedBy({
                    ...req.body.created_by,
                    uid: req.body.created_by.id
                })
            });

        // Save audit activity
        await db()
            .collection('activities')
            .add({
                action: ActivityAction.REGISTERED_ACCOUNT,
                info: {user_id: uid},
                ip: getIp(req),
                type: ActivityType.USER,
                ...createdBy({
                    ...req.body.created_by,
                    uid: req.body.created_by.id
                })
            });

        // Send back the user's ID only
        res.status(200).json({id: uid});
    } catch (error) {
        let errorMessage;
        captureException(error);

        if (error) {
            const values = Object.values(error);

            if (values.length) {
                errorMessage = values[1];
            }
        }

        return res.status(500).json({
            code: 'firebase_invites_register_error',
            message: errorMessage || strings.errors.firebase_invites_register_error
        });
    }
};

export const config = {api: {externalResolver: true}};

export default withSentry(handler);
