const functions = require('firebase-functions');
const firestore = require('@google-cloud/firestore');
const client = new firestore.v1.FirestoreAdminClient();

const config = functions.config();
const bucket = config.backups.bucket;

// https://firebase.google.com/docs/firestore/solutions/schedule-export
exports.scheduledFirestoreExport = functions.pubsub.schedule('every 24 hours').onRun(context => {
    const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
    const databaseName = client.databasePath(projectId, '(default)');

    return client
        .exportDocuments({
            name: databaseName,
            outputUriPrefix: bucket,
            // Leave collectionIds empty to export all collections
            // or set to a list of collection IDs to export,
            // collectionIds: ['users', 'posts']
            collectionIds: []
        })
        .then(responses => {
            const response = responses[0];
            console.log(`Operation Name: ${response['name']}`);
        })
        .catch(err => {
            console.error(err);
            throw new Error('Export operation failed');
        });
});
