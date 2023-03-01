import fetch from 'isomorphic-unfetch';
import {db} from './commands';
import activitiesSeed from '../fixtures/activities.json';
import invitesSeed from '../fixtures/invites.json';
import projectsSeed from '../fixtures/projects.json';
import reportsSeed from '../fixtures/reports.json';
import templatesSeed from '../fixtures/templates.json';
import usersSeed from '../fixtures/users.json';

const hubEmulatorPort = Cypress.env('FIRESTORE_EMULATOR_HUB') || '4400';
const firestoreEmulatorPort = Cypress.env('FIRESTORE_EMULATOR_HOST') || 'localhost:8080';

const seeds = {
    activities: activitiesSeed,
    invites: invitesSeed,
    projects: projectsSeed,
    reports: reportsSeed,
    templates: templatesSeed,
    users: usersSeed
};

const clearDb = async () => {
    const response = await fetch(
        `http://${firestoreEmulatorPort}/emulator/v1/projects/${Cypress.env(
            'FIREBASE_PROJECT_ID'
        )}/databases/(default)/documents`,
        {method: 'DELETE'}
    );

    if (response.status !== 200) {
        throw new Error('Trouble clearing Emulator: ' + (await response.text()));
    }
};

const populateDb = async collectionKeys => {
    const batch = db.batch();

    collectionKeys.map(collectionKey => {
        const documents = seeds[collectionKey].seed;

        Object.keys(documents).map(documentKey => {
            const ref = db.doc(documentKey);
            batch.set(ref, documents[documentKey]);
        });
    });

    await batch.commit();
};

const enableBackgroundTriggers = async () => {
    const response = await fetch(
        `http://localhost:${hubEmulatorPort}/functions/enableBackgroundTriggers`,
        {method: 'PUT'}
    );

    if (response.status !== 200) {
        throw new Error(
            'Trouble enabling database triggers in emulator: ' + (await response.text())
        );
    }
};

const disableBackgroundTriggers = async () => {
    const response = await fetch(
        `http://localhost:${hubEmulatorPort}/functions/disableBackgroundTriggers`,
        {method: 'PUT'}
    );

    if (response.status !== 200) {
        throw new Error(
            'Trouble disabling database triggers in emulator: ' + (await response.text())
        );
    }
};

const resetDb = async () => {
    await disableBackgroundTriggers();
    await clearDb();
    await enableBackgroundTriggers();
};

const seedDb = async collections => {
    await disableBackgroundTriggers();
    await populateDb(collections);
    await enableBackgroundTriggers();
};

const tasks = {resetDb, seedDb};

export default tasks;
