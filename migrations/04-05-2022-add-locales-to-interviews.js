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

const getLocaleFromLanguage = language => {
    const locales = {
        en: 'en-US',
        fr: 'fr-FR',
        es: 'es-ES',
        ar: 'ar-SY'
    };

    return locales[language];
};

const init = async () => {
    try {
        const interviews = await admin.firestore().collectionGroup('interviews').get();
        const publicInterviews = await admin.firestore().collectionGroup('interviews_public').get();
        const batch = admin.firestore().batch();

        const addLocaleToInterview = async doc => {
            const data = doc.data();
            const language = data.primary_language || 'en';

            batch.update(doc.ref, {
                locale: data?.locale || getLocaleFromLanguage(language) || '',
                primary_language: language
            });
        };

        await Promise.all([...interviews.docs, ...publicInterviews.docs].map(addLocaleToInterview));
        await batch.commit();

        console.log('done!');
    } catch (error) {
        console.log(error);
    }
};

init();
