import {firebaseDB, timestamp} from '@/utils/firebase/admin';
import {captureException} from '@sentry/nextjs';
import type {SessionUser} from '@/types/user';
import {firebaseAuth} from '@/utils/firebase';

export const getUserProfileForLogin = async (user): Promise<any> => {
    try {
        const authUser = await firebaseDB().collection('users').doc(user.uid).get();

        if (authUser.exists) {
            const authUserData = authUser.data();
            const now = new Date().getTime();
            const userData = {
                ...authUserData,
                active: now,
                email_verified: user.email_verified,
                role: user.role || authUserData?.role || '',
                uid: user.uid
            };

            // Enumerators only have access to the app, not the admin
            if (userData.role && userData.role !== 'enumerator') {
                // Add the user's latest login to the database
                await firebaseDB().collection('users').doc(user.uid).update({
                    active: timestamp()
                });

                return userData;
            }
        }

        return false;
    } catch (error) {
        captureException(error);
        return false;
    }
};

export const getUserRestrictedProfile = user => {
    const SESSION_FIELDS = [
        'active',
        'email',
        'first_name',
        'id',
        'is_archived',
        'last_name',
        'role',
        'uid'
    ];
    const filteredUser = Object.keys(user)
        .filter(key => SESSION_FIELDS.includes(key))
        .reduce(
            (acc, cur) => ({
                ...acc,
                [cur]: user[cur]
            }),
            {}
        ) as SessionUser;

    return filteredUser;
};

const getTokenExpiry = () => new Date(Date.now() + 1000 * 60 * 60).getTime();

export const signInUser = async (email: string, password: string) => {
    try {
        const signIn = await firebaseAuth().signInWithEmailAndPassword(email, password);

        // If the sign-in was successful, we need to retrieve the user's profile
        // from Firestore and then validate their role
        if (signIn?.user?.uid) {
            // We need to save the user's token for claim verification on API routes
            const token = await firebaseAuth().currentUser.getIdToken(true);
            const user = await getUserProfileForLogin(signIn.user);

            return user?.uid
                ? {...getUserRestrictedProfile(user), token, expires: getTokenExpiry()}
                : null;
        }
    } catch (error) {
        throw new Error(error);
    }
};

export const refreshFirebaseToken = async (token: any) => {
    try {
        const newToken = await firebaseAuth()?.currentUser?.getIdToken(true);

        if (newToken) {
            return {
                ...token,
                user: {
                    ...token.user,
                    token: newToken,
                    expires: getTokenExpiry()
                }
            };
        }
    } catch (error) {
        captureException(error);
        return 'RefreshAccessTokenError';
    }
};
