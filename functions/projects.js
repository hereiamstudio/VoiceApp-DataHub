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

const getRemovedUsers = (newUsers, prevUsers) => {
    const newIds = newUsers.map(i => i.id);
    const prevIds = prevUsers.map(i => i.id);
    const removedUsers = prevIds.filter(i => !newIds.includes(i));

    return removedUsers;
};

/**
 * Handle changes to Project titles. We duplicate Project id/titles in their sub-collections
 * so we need to go through all of the documents and make the change.
 *
 * Handle changes to Project users. If a user is removed from a project we need to remove
 * them from all interviews/public interviews within this project too.
 */
exports.handleProjectUpdate = functions.firestore
    .document('/projects/{projectId}')
    .onUpdate(async (change, context) => {
        const newData = change.after.data();
        const previousData = change.before.data();
        const hasTitleChanged = newData.title !== previousData.title;
        const removedUsersIds = getRemovedUsers(
            newData.assigned_users,
            previousData.assigned_users
        );

        if (hasTitleChanged) {
            try {
                /**
                 * As we will have multiple writes from this request we'll need to
                 * write them in a batch; we can only confirm it was successful once
                 * all writes are complete.
                 */
                const batch = firestore.batch();

                const interviews = await firestore
                    .collectionGroup('interviews')
                    .where('project.id', '==', context.params.projectId)
                    .get();
                const interviewsPublic = await firestore
                    .collectionGroup('interviews_public')
                    .where('project.id', '==', context.params.projectId)
                    .get();
                const questions = await firestore
                    .collectionGroup('questions')
                    .where('project.id', '==', context.params.projectId)
                    .get();
                const questionsPublic = await firestore
                    .collectionGroup('questions_public')
                    .where('project.id', '==', context.params.projectId)
                    .get();

                if (interviews.docs) {
                    interviews.docs.map(doc => {
                        const docRef = firestore
                            .collection('projects')
                            .doc(context.params.projectId)
                            .collection('interviews')
                            .doc(doc.id);

                        batch.update(docRef, {'project.title': newData.title});
                    });
                }

                if (interviewsPublic.docs) {
                    interviewsPublic.docs.map(doc => {
                        const docRef = firestore
                            .collection('projects')
                            .doc(context.params.projectId)
                            .collection('interviews')
                            .doc(doc.id)
                            .collection('interviews_public')
                            .doc(doc.id);
                        batch.update(docRef, {'project.title': newData.title});
                    });
                }

                if (questions.docs) {
                    questions.docs.map(doc => {
                        const interviewDoc = doc.data();
                        const interviewId = interviewDoc.interview.id;

                        const docRef = firestore
                            .collection('projects')
                            .doc(context.params.projectId)
                            .collection('interviews')
                            .doc(interviewId)
                            .collection('questions')
                            .doc(doc.id);

                        batch.update(docRef, {'project.title': newData.title});
                    });
                }

                if (questionsPublic.docs) {
                    questionsPublic.docs.map(doc => {
                        const interviewDoc = doc.data();
                        const interviewId = interviewDoc.interview.id;

                        const docRef = firestore
                            .collection('projects')
                            .doc(context.params.projectId)
                            .collection('interviews')
                            .doc(interviewId)
                            .collection('questions')
                            .doc(doc.id)
                            .collection('questions_public')
                            .doc(doc.id);
                        batch.update(docRef, {'project.title': newData.title});
                    });
                }

                try {
                    await batch.commit();
                } catch (error) {
                    console.log(error);
                }
            } catch (error) {
                // console.log(error);
            }
        }

        if (removedUsersIds.length > 0) {
            /**
             * First we have to retrieve any interviews these users belong to.
             * We use `interviews_public` here as a collection group already exists for it
             * (it's how the app shows a user their available interviews)
             */
            const interviews = await admin
                .firestore()
                .collectionGroup('interviews_public')
                .where('project.id', '==', context.params.projectId)
                .where('assigned_users_ids', 'array-contains-any', removedUsersIds)
                .get();

            if (interviews.docs.length) {
                /**
                 * Each user may not be added to every interview, however we're going to be simply
                 * filtering the content of the interview so we don't need any further checks to
                 * see if a user belongs to an interview. Furthermore, `interviews` and `interviews_public`
                 * documents share the same ID so the updates can be quite simple with a batch.
                 *
                 * One thing to note is that `interviews` includes additional details on users that
                 * `interviews_public` does not. As we've fetched the public documents, we can't get these
                 * details. What we can do here is filter the `assigned_users_ids` for both collections and
                 * to reduce the work done here we can add a cleanup method in the project edit page that
                 * will remove the details of any users that aren't in the `assigned_users_ids` array.
                 */
                const batch = admin.firestore().batch();

                await Promise.all(
                    interviews.docs.map(async doc => {
                        const data = doc.data();
                        const update = {
                            assigned_users_ids: data.assigned_users_ids.filter(
                                id => !removedUsersIds.includes(id)
                            )
                        };

                        const interviewDocRef = await admin
                            .firestore()
                            .collection('projects')
                            .doc(context.params.projectId)
                            .collection('interviews')
                            .doc(doc.id);
                        const interviewPublicDocRef = await admin
                            .firestore()
                            .collection('projects')
                            .doc(context.params.projectId)
                            .collection('interviews')
                            .doc(doc.id)
                            .collection('interviews_public')
                            .doc(doc.id);

                        batch.update(interviewDocRef, update);
                        batch.update(interviewPublicDocRef, update);
                    })
                );

                try {
                    await batch.commit();
                    // console.log('done!');
                } catch (error) {
                    console.log(error);
                }
            }

            return;
        }

        return 'complete';
    });
