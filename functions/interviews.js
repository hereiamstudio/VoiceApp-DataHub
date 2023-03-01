const functions = require('firebase-functions');
const admin = require('firebase-admin');

if (!admin.apps.length) {
    admin.initializeApp();
}

/*
 * We are running this code in the Cloud Functions environment so we don't
 * have to provide any configuration, it's detected automatically from the
 * environment it runs in.
 */
const firestore = admin.firestore();

/**
 * Listen for changes to Interview titles. We duplicate Interview id/titles in their sub-collections
 * so we need to go through all of the documents and make the change.
 *
 * TODO: Is there a better way of handling this?
 */
exports.handleInterviewTitleChange = functions.firestore
    .document('/projects/{projectId}/interviews/{interviewId}')
    .onUpdate(async (change, context) => {
        const newData = change.after.data();
        const previousData = change.before.data();
        const hasTitleChanged = newData.title !== previousData.title;

        /**
         * We only need to perform the updates if the title has changed.
         */
        if (hasTitleChanged) {
            try {
                /**
                 * As we will have multiple writes from this request we'll need to
                 * write them in a batch; we can only confirm it was successful once
                 * all writes are complete.
                 */
                const batch = firestore.batch();

                const questions = await firestore
                    .collectionGroup('questions')
                    .where('project.id', '==', context.params.projectId)
                    .get();
                const questionsPublic = await firestore
                    .collectionGroup('questions_public')
                    .where('project.id', '==', context.params.projectId)
                    .get();

                if (questions.docs) {
                    questions.docs.map(doc => {
                        const docRef = firestore
                            .collection('projects')
                            .doc(context.params.projectId)
                            .collection('interviews')
                            .doc(context.params.interviewId)
                            .collection('questions')
                            .doc(doc.id);

                        batch.update(docRef, {'interview.title': newData.title});
                    });
                }

                if (questionsPublic.docs) {
                    questionsPublic.docs.map(doc => {
                        const docRef = firestore
                            .collection('projects')
                            .doc(context.params.projectId)
                            .collection('interviews')
                            .doc(context.params.interviewId)
                            .collection('questions')
                            .doc(doc.id)
                            .collection('questions_public')
                            .doc(doc.id);
                        batch.update(docRef, {'interview.title': newData.title});
                    });
                }

                try {
                    await batch.commit();
                } catch (error) {
                    console.log(error);
                }
            } catch (error) {
                console.log(error);
            }
        }

        return 'complete';
    });

/**
 * Listen for new interview documents.
 * This handler is used to update "interviews" count stored in the parent Project document and its
 * public document too.
 */
exports.handleInterviewDocumentCreate = functions.firestore
    .document('/projects/{projectId}/interviews/{interviewId}')
    .onCreate(async (snap, context) => {
        const projectRef = firestore.collection('projects').doc(context.params.projectId);

        try {
            await projectRef.update({
                interviews_count: admin.firestore.FieldValue.increment(1)
            });
        } catch (error) {
            // console.log(error);
        }
    });

/**
 * Listen for interview document updates.
 * This handler is used to update "interviews" count stored in the parent Project document.
 */
exports.handleInterviewDocumentArchive = functions.firestore
    .document('/projects/{projectId}/interviews/{interviewId}')
    .onUpdate(async (change, context) => {
        const newData = change.after.data();
        const previousData = change.before.data();

        if (newData.is_archived !== previousData.is_archived) {
            const projectRef = firestore.collection('projects').doc(context.params.projectId);

            try {
                /**
                 * If the document is now archived, we need to deprecate the count.
                 * Otherwise, if it has been restored, we need to increment the count.
                 */
                if (newData.is_archived) {
                    await projectRef.update({
                        interviews_count: admin.firestore.FieldValue.increment(-1)
                    });
                } else {
                    await projectRef.update({
                        interviews_count: admin.firestore.FieldValue.increment(1)
                    });
                }
            } catch (error) {
                // console.log(error);
            }
        }
    });
