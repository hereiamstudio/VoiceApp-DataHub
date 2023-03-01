import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/firestore';
import {attachCustomCommands} from 'cypress-firebase';
import 'cypress-wait-until';
import firebaseTasks from './firebase';
import '@testing-library/cypress/add-commands';

const shouldUseEmulator = Cypress.env('USE_FIREBASE_EMULATOR');
const firebaseConfig = {
    apiKey: Cypress.env('FIREBASE_API_KEY'),
    authDomain: Cypress.env('FIREBASE_AUTH_DOMAIN'),
    databaseURL: Cypress.env('FIREBASE_PROJECT_ID'),
    projectId: Cypress.env('FIREBASE_PROJECT_ID'),
    storageBucket: Cypress.env('FIREBASE_STORAGE_URL')
};

if (shouldUseEmulator) {
    firebaseConfig.databaseURL = `${
        Cypress.env('FIRESTORE_EMULATOR_HOST') || 'http://localhost:9000'
    }?ns=${firebaseConfig.projectId}`;
    console.debug(`Using RTDB emulator: ${firebaseConfig.databaseURL}`);
}

firebase.initializeApp(firebaseConfig);
firebase.firestore.setLogLevel('error');

const Timestamp = firebase.firestore.Timestamp;
const db = firebase.firestore();

if (shouldUseEmulator) {
    const authEmulatorHost = Cypress.env('FIREBASE_AUTH_EMULATOR_HOST') || 'http://localhost:9099/';
    const firestoreEmulatorHost = Cypress.env('FIRESTORE_EMULATOR_HOST') || 'localhost:8080';
    const firestoreSettings = {
        experimentalForceLongPolling: false,
        host: firestoreEmulatorHost,
        ssl: false
    };

    // Needed for Firestore support in Cypress (see https://github.com/cypress-io/cypress/issues/6350)
    if (window.Cypress) {
        firestoreSettings.experimentalForceLongPolling = true;
    }

    db.settings(firestoreSettings);
    firebase.auth().useEmulator(authEmulatorHost);

    console.debug(`Using Firestore emulator: ${firestoreSettings.host}`);
    console.debug(`Using Auth emulator: ${authEmulatorHost}`);
}

export {db, Timestamp};

attachCustomCommands({Cypress, cy, firebase});

declare global {
    namespace Cypress {
        interface Chainable {
            /**
             * Custom commands to mock NextAuth sessions.
             * @example cy.authLogin('adminstrator');
             */
            authLogin(role: string): Chainable<Element>;
            authLogout(): Chainable<Element>;
            /**
             * Custom commands to reset emulator database.
             */
            resetDb(): Chainable<Element>;
            seedDb(collections: string[]): Chainable<Element>;
            /**
             * Custom command to prep auth and seeding.
             */
            loginAndSeedDB(role: string, collections: string[], path: string): Chainable<Element>;
        }
    }
}

// Preserve auth cookie across pages, otherwise the user will be logged out
// between every navigation change
Cypress.Cookies.defaults({preserve: 'next-auth.session-token'});

Cypress.Commands.add('authLogout', () => {
    cy.logout();
    cy.clearCookie('next-auth.session-token');
    cy.clearLocalStorage();
});

// @ts-ignore
Cypress.Commands.add('authLogin', role => {
    const UIDs = {
        administrator: Cypress.env('ADMINISTRATOR_UID'),
        assessment_lead: Cypress.env('ASSESSMENT_LEAD_UID'),
        enumerator: Cypress.env('ENUMERATOR_UID')
    };

    cy.login(UIDs[role]);
    // const auth = firebase.auth().signInWithEmailAndPassword(email, password);
    // const {refreshToken} = auth.i.user;
    // const token = await firebase.auth().currentUser.getIdToken();

    // https://github.com/nextauthjs/next-auth/discussions/2053#discussioncomment-1191016
    cy.intercept('/api/auth/session', {fixture: `session-${role}.json`}).as('session');
    // Set the cookie for cypress.
    // It has to be a valid cookie so next-auth can decrypt it and confirm its validity.
    // This step can probably/hopefully be improved.
    // We are currently unsure about this part.
    // We need to refresh this cookie once in a while.
    // We are unsure if this is true and if true, when it needs to be refreshed.
    cy.setCookie('next-auth.session-token', Cypress.env('NEXTAUTH_SESSION_TOKEN'));
    // Cypress.Cookies.preserveOnce('next-auth.session-token');
});

Cypress.Commands.add('resetDb', () => {
    firebaseTasks.resetDb();
});

Cypress.Commands.add('seedDb', collections => {
    firebaseTasks.seedDb(collections);
});

Cypress.Commands.add('loginAndSeedDB', (role, collections = [], path) => {
    cy.resetDb();
    cy.seedDb(['users', ...collections]);
    cy.authLogin(role);
    cy.visit(path);
    cy.wait('@session', {timeout: 2000});
});

Cypress.Commands.add('getByTestId', (id, ...args) => {
    return cy.get(`[data-testid=${id}]`, ...args);
});
