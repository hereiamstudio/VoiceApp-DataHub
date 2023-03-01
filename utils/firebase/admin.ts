import * as admin from 'firebase-admin';
import {hasClaim} from '@/utils/roles';
import type {User} from '@/types/user';

if (!admin.apps.length) {
    const firebasePrivateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (firebasePrivateKey) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                clientEmail: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL,
                // https://stackoverflow.com/a/41044630/1332513
                privateKey: firebasePrivateKey.replace(/\\n/g, '\n')
            }),
            databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_URL
        });
    }
}

export const firebaseAdmin = admin.auth;

export const firebaseStorage = admin.storage;

export const firebaseDB = admin.firestore;

// https://firebase.google.com/docs/emulator-suite/connect_auth#admin_sdks
if (process.env.USE_FIREBASE_EMULATOR) {
    process.env['FIRESTORE_EMULATOR_HOST'] = 'localhost:8080';
}

export const verifyIdToken = (token: string) => {
    return firebaseAdmin()
        .verifyIdToken(token)
        .catch(error => {
            throw error;
        });
};

export const userHasClaim = async (token: string, action: string, data?: any) => {
    /**
     * TODO: Perhaps we can create a cache here to reduce the number of required validations
     * within a speific timeframe?
     */
    if (token) {
        try {
            const user = await firebaseAdmin().verifyIdToken(token);

            if (!user || user.is_archived || !hasClaim(user.role, action, data)) {
                throw new Error();
            }
        } catch (error) {
            throw new Error(error?.message);
        }
    } else {
        throw new Error('missing token');
    }
};

export const timestamp = () => admin.firestore.FieldValue.serverTimestamp();

export const createdBy = (user: Partial<User>) => {
    return {
        created_at: timestamp(),
        created_by: {
            first_name: user.first_name,
            last_name: user.last_name,
            id: user.uid
        }
    };
};

export const updatedBy = (user: Partial<User>) => {
    return {
        updated_at: timestamp(),
        updated_by: {
            first_name: user.first_name,
            last_name: user.last_name,
            id: user.uid
        }
    };
};
