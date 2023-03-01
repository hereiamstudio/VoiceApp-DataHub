import {firebaseAuth} from '@/utils/firebase/index';

export const sendVerificationEmail = (uid: string) => {
    const hostUrl =
        process.env.NEXT_PUBLIC_HOST_URL || process.env.VERCEL_URL || window?.location?.host;

    return firebaseAuth().currentUser.sendEmailVerification({
        url: `https://${hostUrl}/account/${uid}/verify`
    });
};
