import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_PUBLIC_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_URL,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
};

if (!firebase.apps.length) {
    firebase.initializeApp(config);
}

// https://stackoverflow.com/a/68128826
const EMULATORS_STARTED = 'EMULATORS_STARTED';

const startEmulators = () => {
    if (!global[EMULATORS_STARTED]) {
        global[EMULATORS_STARTED] = true;
        firebase.firestore().useEmulator('localhost', 8080);
        firebase.auth().useEmulator('http://localhost:9099/');
        process.env['FIRESTORE_EMULATOR_HOST'] = 'localhost:8080';
    }
};

if (process.env.USE_FIREBASE_EMULATOR) {
    startEmulators();
}

export const firebaseAuth = firebase.auth;
