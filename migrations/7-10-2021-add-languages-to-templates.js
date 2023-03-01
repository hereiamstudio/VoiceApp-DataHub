require('dotenv').config();
const admin = require('firebase-admin');
const {faker} = require('@faker-js/faker');

const firebasePrivateKey = process.env.FIREBASE_PRIVATE_KEY;

admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL,
        // https://stackoverflow.com/a/41044630/1332513
        privateKey: firebasePrivateKey.replace(/\\n/g, '\n')
    }),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
});

const init = async () => {
    try {
        const templates = await admin.firestore().collection('templates').get();
        const batch = admin.firestore().batch();

        templates.docs.map(doc => {
            const data = doc.data();

            batch.set(doc.ref, {
                ...data,
                primary_language: 'en'
            });
        });

        await batch.commit();
        console.log('done!');
    } catch (error) {
        console.log(error);
    }
};

init();
