const functions = require('firebase-functions');
const logger = require('firebase-functions/lib/logger');
const admin = require('firebase-admin');
const {Translate} = require('@google-cloud/translate').v2;
const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');
const {PromisePool} = require('@supercharge/promise-pool');
const chunk = require('lodash/chunk');
const findKey = require('lodash/findKey');
const flatMap = require('lodash/flatMap');
const decrypt = require('./encryption/decrypt');

if (!admin.apps.length) {
    admin.initializeApp();
}

/*
 * We are running this code in the Cloud Functions environment so we don't
 * have to provide any configuration, it's detected automatically from the
 * environment it runs in.
 */
const firestore = admin.firestore();
const secretManagerClient = new SecretManagerServiceClient();
const config = functions.config();

const getSecret = async name => {
    try {
        const [version] = await secretManagerClient.accessSecretVersion({name});

        if (version.payload) {
            return version.payload.data.toString('utf8');
        }
    } catch (error) {
        logger.error(`secret not found for ${name}`);

        return error;
    }
};

const getTime = timestamp => {
    if (timestamp.hasOwnProperty('toDate')) {
        return new Date(timestamp.toDate()).getTime();
    } else {
        return new Date(timestamp).getTime();
    }
};

const getTranslatedResponses = async (response, lang = 'en') => {
    const translate = new Translate();
    let [translations] = await translate.translate(response, lang);

    return Array.isArray(translations) ? translations : [translations];
};

const getDecryptedData = async data => {
    /**
     * If the data has been sent encrypted we need the secret to be able to decrypt the data.
     */
    if (data.encryption_version) {
        try {
            const config = functions.config().encryption;
            const passphrase = await getSecret(config.key_passphrase_resource_id);
            const privateKey = await getSecret(config.private_key_resource_id);

            /**
             * If the passphrase or private key is not found, we can't decrypt the data. Bail.
             */
            if (!passphrase) {
                throw new Error('passphrase not found');
            } else if (!privateKey) {
                throw new Error('private key not found');
            } else {
                const decryptedData = decrypt(data, privateKey, passphrase);

                if (decryptedData) {
                    return JSON.parse(decryptedData);
                } else {
                    throw new Error('unable to decrypt data');
                }
            }
        } catch (error) {
            throw new Error(error);
        }
    } else {
        return data;
    }
};

const processResponseQueueDoc = async (responseData, projectId, interviewId, responseId) => {
    const data = await getDecryptedData(responseData);

    if (!data) {
        return logger.error('data not returned');
    }

    const interviewRef = await firestore
        .collection('projects')
        .doc(projectId)
        .collection('interviews')
        .doc(interviewId)
        .get();

    /**
     * If we can't find the interview then we can't save a response for it.
     */
    if (!interviewRef) {
        return logger.error('interview not found');
    }

    const interview = interviewRef.data();
    const enumerator = interview.assigned_users.find(user => user.id === data.enumerator_id);

    /**
     * If we can't find the enumerator in the list of assigned users then they are not allowed
     * to create this document. Bail out.
     */
    if (!enumerator) {
        return logger.error('access denied for this enumerator');
    }

    /**
     * Get the interview's primary language. If this is not English, we will need to translate
     * all open responses into English.
     */
    const primary_language = interview.primary_language || 'en';

    /**
     * Create a new object for our new formatted document.
     */
    const formattedResponseData = {
        project: {
            id: projectId,
            title: interview.project.title
        },
        interview: {
            id: interviewId,
            title: interview.title
        },
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        created_by: {
            id: enumerator.id,
            first_name: enumerator.first_name,
            last_name: enumerator.last_name
        },
        start_time: data.start_time,
        end_time: data.end_time,
        duration: getTime(data.end_time) - getTime(data.start_time),
        age: data.age,
        gender: data.gender,
        is_beneficiary: data.beneficiary || '',
        consent_relationship: data.consent_relationship || '',
        primary_language,
        enumerator_notes: {
            text: data.enumerator_notes || ''
        }
    };

    /**
     * If the interview's primary language is not English, we need to
     * translate the consent relationship if it exists. We can also translate
     * the gender value directly.
     */
    if (primary_language !== 'en') {
        const translatedGenders = {
            male: ['male', 'ذكر', 'masculino', 'homme'],
            female: ['female', 'أنثى', 'mujer', 'femme'],
            other: ['other', 'أخرى', 'otro', 'autre']
        };

        formattedResponseData.original_gender = formattedResponseData.gender;
        formattedResponseData.gender =
            findKey(translatedGenders, i =>
                i.includes(formattedResponseData.gender.toLowerCase())
            ) || formattedResponseData.gender;

        if (formattedResponseData.consent_relationship) {
            const translatedConsentRelationship = await getTranslatedResponses(
                formattedResponseData.consent_relationship
            );

            formattedResponseData.original_consent_relationship =
                formattedResponseData.consent_relationship;
            formattedResponseData.consent_relationship = translatedConsentRelationship[0];
        }
    }

    /**
     * Create a new object for each answer in the response.
     */
    const formattedAnswers = {};

    data.questions.forEach(question => {
        formattedAnswers[question.id] = {
            answers: question.answers,
            original_answers: [],
            type: question.type || '',
            is_probing_question: question.probing_question,
            is_flagged: question.flagged,
            is_skipped: question.skipped,
            is_starred: question.starred,
            question: {
                id: question.id,
                order: question.order,
                title: question.title
            },
            is_proofed: false,
            transcribed_answer: question.transcribed_answer || '',
            used_transcription: question.transcription
        };

        // If answers are missing it means that this question was bypassed because of skip logic
        if (!formattedAnswers[question.id].answers) {
            formattedAnswers[question.id].answers = [];
            formattedAnswers[question.id].is_skipped_by_skip_logic = true;
        }
    });

    /**
     * If the interview's primary language is not English, we need to
     * translate all open responses.
     */
    if (primary_language !== 'en') {
        /**
         * To simplify merging of answers array (which can contain nested arrays when multi-code
         * questions are used) to the translations array (a flat array) we will join nested arrays
         * with a delimiter so we can easily translate a single string then split after translation
         * is complete.
         */
        const DELIMITER = '~~~~';

        /**
         * Group all open responses and IDs.
         */
        const openResponses = data.questions
            .filter(question => question?.answers?.length > 0)
            .map(question => ({
                id: question.id,
                answers: question.answers.join(DELIMITER)
            }));

        /**
         * Translate all open response answers
         */
        // const translatedOpenResponses = await getTranslatedResponses(
        //     openResponses.map(response => response.answers)
        // );

        const openResponsesForTranslation = openResponses.map(response => response.answers);

        /**
         * Split responses into chunks of 100 to get around the translation limit
         * of 128 bits. We'll then pool the chunks 1 at a time.
         * https://cloud.google.com/translate/docs/reference/rest/v2/translate#query-parameters
         */
        const chunkedResponses = chunk(openResponsesForTranslation, 100);
        const {results, errors} = await PromisePool.withConcurrency(1)
            .for(chunkedResponses)
            .handleError(async (error, user, pool) => {
                if (error) {
                    logger.error(error);
                    return pool.stop();
                }
            })
            .process(async (response, index, pool) => {
                try {
                    const translations = await getTranslatedResponses(response);
                    return translations;
                } catch (error) {
                    logger.error(error);
                }
            });

        if (errors && errors.length) {
            logger.error(errors);
            return;
        }

        if (!results.length) {
            logger.warn('no translations were returned');
        }

        /**
         * With our translated responses, we can find their question ID by
         * using the index of the response and taking the ID from the open
         * responses we grouped above.
         */
        flatMap(results).forEach((translation, index) => {
            formattedAnswers[openResponses[index].id] = {
                ...formattedAnswers[openResponses[index].id],
                ...{
                    answers: translation.split(DELIMITER),
                    original_answers: openResponses[index].answers.split(DELIMITER),
                    is_proofed: true,
                    is_translated: true
                }
            };
        });
    }

    /**
     * As we will have multiple writes from this request we'll need to
     * write them in a batch; we can only confirm it was successful once
     * all writes are complete.
     */
    const batch = admin.firestore().batch();

    /**
     * Save the combined response and answers.
     */
    const responseRef = firestore
        .collection('projects')
        .doc(projectId)
        .collection('interviews')
        .doc(interviewId)
        .collection('responses')
        .doc(responseId);

    batch.set(responseRef, {
        ...formattedResponseData,
        answers: formattedAnswers
    });

    /**
     * Delete the document from the queue.
     */
    const responseQueueRef = await firestore
        .collection('projects')
        .doc(projectId)
        .collection('interviews')
        .doc(interviewId)
        .collection('responses_queue')
        .doc(responseId);

    // batch.delete(responseQueueRef);

    try {
        batch.commit();
    } catch (error) {
        console.log(error);
    }

    return 'complete';
};

/**
 * Manually trigger the processing of the queue. This can be used to handle responses that were not processed
 * via the document create trigger.
 */
exports.processResponsesQueue = functions.https.onRequest(async (req, res) => {
    if (!req.query.projectId || !req.query.interviewId) {
        res.send('project and interview ID must be passed in url parameters');
    }

    /**
     * Retrieve all documents that are in the queue for this interview.
     */
    const responses = await firestore
        .collection('projects')
        .doc(req.query.projectId)
        .collection('interviews')
        .doc(req.query.interviewId)
        .collection('responses_queue')
        .orderBy('id', 'asc')
        .limit(req.query?.limit ? parseInt(req.query.limit) : 1000)
        .offset(req.query?.offset ? parseInt(req.query.offset) : 0)
        .get();

    if (responses.docs.length) {
        try {
            const queueDocs = await Promise.all(
                responses.docs.map(async doc => {
                    const docData = doc.data();

                    try {
                        /**
                         * Before we process the document, ensure it hasn't been processed already
                         * (in this case the error would be in removing from the queue, not in processing).
                         */
                        const processedResponse = await admin
                            .firestore()
                            .collection('projects')
                            .doc(req.query.projectId)
                            .collection('interviews')
                            .doc(req.query.interviewId)
                            .collection('responses')
                            .doc(doc.id)
                            .get();

                        if (!processedResponse.exists) {
                            const processed = await processResponseQueueDoc(
                                docData,
                                req.query.projectId,
                                req.query.interviewId,
                                doc.id
                            );

                            return `${doc.id} ${
                                processed ? 'processed and removed from the queue' : 'had an error'
                            }`;
                        }
                    } catch (error) {
                        logger.error('an error occurred', error);
                        return error.message || error;
                    }
                })
            );

            res.send(queueDocs);
        } catch (error) {
            logger.error(error);
            res.send(error);
        }
    } else {
        res.send('no documents to process');
    }
});

/**
 * Listen for the App's response submissions for interviews. The App will send a single document
 * and minimal data, so it's up to us to then break out the document to it's required format and
 * include the additional data that's required.
 */
exports.handleNewResponseQueueDocument = functions.firestore
    .document('/projects/{projectId}/interviews/{interviewId}/responses_queue/{responseId}')
    .onCreate(async (snapshot, context) => {
        try {
            await processResponseQueueDoc(
                snapshot.data(),
                context.params.projectId,
                context.params.interviewId,
                context.params.responseId
            );

            return `${context.params.responseId} processed and removed from the queue`;
        } catch (error) {
            logger.error(error);
        }
    });

const deleteCachedReportData = async (projectId, interviewId, language = 'data') => {
    const bucket = admin.storage().bucket(`gs://${config.storage.url}`);

    await bucket.deleteFiles({
        prefix: `reports/${projectId}/${interviewId}/`
    });
    await bucket.deleteFiles({
        prefix: `exports/${projectId}/${interviewId}/`
    });
};

/**
 * Listen for new response documents.
 * This handler is used to update "responses" count stored in the parent Interview document.
 * It is also used to delete any saved reports or exports for its parent Interview.
 */
exports.handleResponseDocumentCreate = functions.firestore
    .document('/projects/{projectId}/interviews/{interviewId}/responses/{responseId}')
    .onCreate(async (snap, context) => {
        const interviewRef = firestore
            .collection('projects')
            .doc(context.params.projectId)
            .collection('interviews')
            .doc(context.params.interviewId);

        try {
            await interviewRef.update({
                responses_count: admin.firestore.FieldValue.increment(1)
            });
        } catch (error) {
            // console.log(error);
        }

        try {
            const batch = admin.firestore().batch();
            const data = snap.data();

            Object.entries(data.answers).forEach(async ([questionId, answer]) => {
                const docRef = firestore
                    .collection('projects')
                    .doc(context.params.projectId)
                    .collection('interviews')
                    .doc(context.params.interviewId)
                    .collection('responses')
                    .doc(context.params.responseId)
                    .collection('response_answers')
                    .doc(questionId);

                batch.set(docRef, {
                    ...answer,
                    response_id: context.params.responseId,
                    interview: data.interview,
                    project: data.project
                });
            });

            await batch.commit();
        } catch (error) {
            logger.error(error.message);
        }

        try {
            await deleteCachedReportData(context.params.projectId, context.params.interviewId);
        } catch (error) {
            logger.error(error);
        }
    });

// exports.deleteCachedFiles = functions.https.onRequest(async (req, res) => {
//     try {
//         const response = await deleteCachedReportData(req.query.projectId, req.query.interviewId);
//         res.send(response);
//     } catch (error) {
//         res.send(error.message);
//     }
// });
