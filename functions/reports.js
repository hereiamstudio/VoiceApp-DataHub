const functions = require('firebase-functions');
const util = require('util');
const crypto = require('crypto');
const logger = require('firebase-functions/lib/logger');
const admin = require('firebase-admin');
const {storage} = require('firebase-admin');
const {parse: json2csv} = require('json2csv');
const ExcelJS = require('exceljs');
const dayjs = require('dayjs');
const capitalize = require('lodash/capitalize');
const kebabCase = require('lodash/kebabCase');
const snakeCase = require('lodash/snakeCase');
const sortBy = require('lodash/sortBy');
const trim = require('lodash/trim');

if (!admin.apps.length) {
    admin.initializeApp();
}

// console.log(util.inspect(myObject, false, null, true))

/*
 * We are running this code in the Cloud Functions environment so we don't
 * have to provide any configuration, it's detected automatically from the
 * environment it runs in.
 */
const firestore = admin.firestore();
const config = functions.config();

const getIp = req => {
    return (
        (req.headers['x-forwarded-for'] || '').split(',').pop().trim() ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        req.connection?.socket?.remoteAddress ||
        ''
    );
};

const validateFirebaseIdToken = async token => {
    if (!token) {
        return;
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);

        return decodedToken;
    } catch (error) {
        logger.error(error);
    }
};

const humanise = string => {
    return capitalize(trim(snakeCase(string).replace(/_id$/, '').replace(/_/g, ' ')));
};

const getQuestionTranslations = (question, allQuestions, primary_language, requested_language) => {
    const questionData = allQuestions.find(q => q.id === question.id);

    // We need the type to determine how to format response answers
    question.type = questionData?.type;

    // First, create a new question title object for the primary language if it hasn't been already.
    if (typeof question.title === 'string') {
        question.title = {[primary_language]: question.title};
        question.options = {[primary_language]: questionData?.options};
    }

    // If the question includes translations for the requested language, add it!
    if (
        primary_language !== requested_language &&
        questionData &&
        Object.keys(questionData?.translations || {}).includes(requested_language)
    ) {
        question.title[requested_language] =
            questionData.translations[requested_language].title || question.title;

        // if the question has options, translate those too
        if (
            questionData.type !== 'free_text' &&
            questionData.translations?.[requested_language]?.options
        ) {
            question.options[requested_language] =
                questionData.translations[requested_language].options;
        }
    }

    return question;
};

const isKeyExcluded = (key, excludeKeys) => {
    const matchKeys = {
        ignored: key => key === 'Ignored',
        enumerator_id: key => key === 'Enumerator ID',
        enumerator_name: key => key === 'Enumerator Name',
        enumerator_notes: key => key === 'Enumerator Notes',
        age: key => key === 'Age',
        gender: key => key === 'Gender',
        beneficiary: key => key === 'Beneficiary',
        consent_relationship: key => key === 'Consent Relationship',
        start_time: key => key === 'Started',
        end_time: key => key === 'Ended',
        skipped: key => key.endsWith(' / Skipped'),
        flagged: key => key.endsWith(' / Flagged'),
        starred: key => key.endsWith(' / Starred'),
        proofed: key => key.endsWith(' / Proofed'),
        translated: key => key.endsWith(' / Translated'),
        used_transcription: key => key.endsWith(' / Used transcription'),
        original_answer: key => key.endsWith(' / Original answer')
    };

    const isExcluded = excludeKeys.map(excludeKey => {
        /**
         * We use 'endsWith' here as when filtering proofs, stars, etc., the keys start with the question numbers,
         * this means that we won't be able to do strict equal check.
         */
        return matchKeys[excludeKey]?.(key);
    });

    return isExcluded.includes(true);
};

const filterResponse = (response, filters) => {
    let filteredResponse = response;

    if (filters?.exclude) {
        const exclude =
            typeof filters.exclude === 'string' ? filters.exclude.split(',') : filters.exclude;

        filteredResponse = Object.keys(response)
            .filter(key => !isKeyExcluded(key, exclude))
            .reduce((obj, key) => {
                obj[key] = response[key];
                return obj;
            }, {});
    }

    return filteredResponse;
};

const getTime = timestamp => {
    if (typeof timestamp === 'string') {
        return timestamp;
    } else if (timestamp?._seconds) {
        return timestamp._seconds * 1000;
    } else {
        return new Date(timestamp);
    }
};

const getResponseTitle = (isSkipped, isSkippedBySkipLogic, isCodedQuestion, questionOptions) => {
    if (isSkipped || isSkippedBySkipLogic) return '';

    return isCodedQuestion
        ? questionOptions.map((option, index) => `${index + 1}. ${option}`).join(' / ')
        : '';
};

const getResponseAnswer = (isSkipped, isSkippedBySkipLogic, isCodedQuestion, answers, options) => {
    if (isSkipped || isSkippedBySkipLogic) return '';

    if (isCodedQuestion) {
        return answers
            .map(answer => {
                const index = options?.findIndex(option => option === answer) || 0;
                return `${index + 1}. ${answer}`;
            })
            .join(' / ');
    } else {
        return answers?.[0] || '';
    }
};

const getQuestionOptionSelected = (isSkipped, isSkippedBySkipLogic, option, answers) => {
    if (isSkipped || isSkippedBySkipLogic) return '';

    return answers.includes(option) ? '1' : '0';
};

const getQuestionNumber = (answerOrder, questionOrder, isProbingQuestion) => {
    let number = answerOrder || questionOrder;

    // TODO: Trace why some orders are based on 100 increments and others are not
    if (number < 100) {
        number = number * 100;
    }

    if (isProbingQuestion) {
        number = number + 1;
    }

    return number / 100;
};

const getFormattedResponses = (responses, filters, requestedLanguage, primaryLanguage) => {
    const formattedResponses = responses
        .map(response => {
            const formattedResponse = {
                Project: response?.project?.title || '',
                Interview: response?.interview?.title || '',
                'Interview language': primaryLanguage,
                Age: response.age,
                Gender: response.gender,
                ['Beneficiary']: response.is_beneficiary ? '1' : '0',
                ['Consent Relationship']: response.consent_relationship || '',
                Started: dayjs(getTime(response.start_time)).format('MMMM D YYYY, H:mma'),
                Ended: dayjs(getTime(response.end_time)).format('MMMM D YYYY, H:mma'),
                ['Enumerator Notes']: response?.enumerator_notes?.text || ''
            };

            if (response.created_by?.id) {
                formattedResponse['Enumerator ID'] = response.created_by.id;
                formattedResponse[
                    'Enumerator Name'
                ] = `${response.created_by?.first_name} ${response.created_by.last_name}`;
            } else {
                formattedResponse['Enumerator ID'] = '-';
                formattedResponse['Enumerator Name'] = '-';
            }

            if (requestedLanguage !== primaryLanguage) {
            }

            sortBy(response.answers, a => a.order || a.question.order).map(
                (answer, answerIndex) => {
                    const {
                        answers,
                        is_flagged,
                        is_probing_question,
                        is_proofed,
                        is_skipped,
                        is_skipped_by_skip_logic,
                        is_starred,
                        is_translated,
                        original_answers,
                        question,
                        used_transcription
                    } = answer;
                    const isCodedQuestion = answer.question.type !== 'free_text';
                    const number = getQuestionNumber(
                        answer.order,
                        answer.question.order,
                        is_probing_question
                    );
                    const title = `${number}. ${answer?.question?.title || ''}`;

                    // For coded questions we need to include a list of all options
                    if (isCodedQuestion) {
                        formattedResponse[title] = isCodedQuestion
                            ? question.options
                                  ?.map((option, index) => `${index + 1}. ${option}`)
                                  ?.join('|') || ''
                            : '';
                    }

                    formattedResponse[`${title} / Answer`] = getResponseAnswer(
                        is_skipped,
                        is_skipped_by_skip_logic,
                        isCodedQuestion,
                        requestedLanguage !== 'en' ? original_answers : answers,
                        question.options
                    );

                    if (!isCodedQuestion) {
                        formattedResponse[`${title} / Original answer`] = getResponseAnswer(
                            is_skipped,
                            is_skipped_by_skip_logic,
                            isCodedQuestion,
                            requestedLanguage !== 'en' ? original_answers : answers,
                            question.options
                        );
                    }

                    if (isCodedQuestion) {
                        question.options?.map((option, index) => {
                            formattedResponse[`${title} / ${index + 1}. ${option}`] =
                                getQuestionOptionSelected(
                                    is_skipped,
                                    is_skipped_by_skip_logic,
                                    option,
                                    requestedLanguage !== 'en' ? original_answers : answers
                                );
                        });
                    }

                    // In our April 2022 release, we added skip logic. This resulted in our
                    // existing use of 'skipped' (when a user skips a question, rather than
                    // when skip logic is triggered) to be used alongside 'skipped_by_skip_logic'.
                    // Although this makes sense in the schema, it causes UI confusion and is not clear.
                    //
                    // Pending a database migration for all existing data, we track stored data
                    // like so:
                    // `skipped` = a user skipped a question
                    // `skipped_by_skip_logic` = a user skipped a question via skip logic
                    // And we present the user with the following:
                    // `skipped` = Ignored
                    // `skipped_by_skip_logic` = Skipped
                    formattedResponse[`${title} / Skipped`] = is_skipped_by_skip_logic ? '1' : '0';
                    formattedResponse[`${title} / Ignored`] =
                        is_skipped && !is_skipped_by_skip_logic ? '1' : '0';

                    if (!isCodedQuestion) {
                        formattedResponse[`${title} / Proofed`] =
                            !is_translated && is_proofed ? '1' : '0';
                        formattedResponse[`${title} / Flagged`] = is_flagged ? '1' : '0';
                        formattedResponse[`${title} / Starred`] = is_starred ? '1' : '0';
                        formattedResponse[`${title} / Translated`] = is_translated ? '1' : '0';
                        formattedResponse[`${title} / Used transcription`] = used_transcription
                            ? '1'
                            : '0';
                    }
                }
            );

            return formattedResponse;
        })
        .map(response => filterResponse(response, filters));

    // Now we have all responses, we need to get all keys then find the unique
    // keys. This let's us ensure columns stay in order if responses have probing
    // questions and a) others don't b) others do, but before different questions
    const allKeys = formattedResponses
        .map(response => Object.keys(response))
        .flatMap(response => response);
    const uniqueKeys = Array.from(new Set(allKeys));
    const formattedResponsesWithAllProbingQuestions = formattedResponses.map(response => {
        const responseWithAllProbingQuestions = {};

        uniqueKeys.forEach(key => {
            responseWithAllProbingQuestions[key] = response[key] || '';
        });

        return responseWithAllProbingQuestions;
    });

    return formattedResponsesWithAllProbingQuestions;
};

const createExport = (interviews, filters, requestedLanguage, primaryLanguage) => {
    const formattedResponses = interviews.map(interview =>
        getFormattedResponses(interview.responses, filters, requestedLanguage, primaryLanguage)
    );

    return formattedResponses;
};

const generateCsv = async reports => {
    /**
     * CSV exports cannot contain multiple reports, simply take the first from the list.
     */
    const firstInterview = reports[0];
    const csv = json2csv(firstInterview);
    /**
     * The UTF BOM is used to fix encoding issues with Arabic characters (and others, no doubt)
     * https://stackoverflow.com/questions/19492846/javascript-to-csv-export-encoding-issue
     */
    const csvAndBOM = `${csv}\uFEFF`;

    return csvAndBOM;
};

const generateExcel = async (reports, user) => {
    const workbook = new ExcelJS.Workbook();

    workbook.creator = `${user.first_name} ${user.last_name}`;
    workbook.lastModifiedBy = `${user.first_name} ${user.last_name}`;
    workbook.created = new Date();
    workbook.modified = new Date();

    reports
        .filter(i => i)
        .map(report => {
            const responses = report.filter(i => i);

            if (responses.length > 0) {
                const sheet = workbook.addWorksheet(responses[0].interview);

                sheet.columns = Object.keys(responses[0]).map(key => ({
                    header: key,
                    key
                }));
                responses.map(item => {
                    sheet.addRow(Object.values(item));
                });

                sheet.columns.forEach(column => {
                    let maxColumnLength = 0;

                    column.eachCell({includeEmpty: true}, cell => {
                        maxColumnLength = Math.max(
                            maxColumnLength,
                            10,
                            cell.value ? cell.value.toString().length : 0
                        );
                    });

                    column.width = maxColumnLength + 2;
                });
            }
        });

    const buffer = await workbook.xlsx.writeBuffer();

    return buffer;
};

const getExportFile = async (type, report, user) => {
    const generators = {
        csv: generateCsv,
        excel: generateExcel
    };
    const fileContent = await generators[type](report, user);

    return fileContent;
};

const getFilename = (title, type) => {
    const extensions = {
        excel: 'xlsx',
        csv: 'csv'
    };

    return `${encodeURIComponent(title)}.${extensions[type]}`;
};

const redirectBackToReport = (res, redirectUrl, error) => {
    return res.redirect(`${redirectUrl}?error=${encodeURIComponent(error)}`);
};

// Each unique set of fields yields a unique cached file. To match fields to a file
// we can create a hash of the fields and use that as the filename.
const getStoredFileFilename = (filename, fields, language) => {
    const hash = crypto.createHash('md5').update(JSON.stringify(fields)).digest('hex');

    return `${hash}-${language}-${filename}`;
};

const getStoredFilePath = (projectId, interviewIds, filename, language, fields) => {
    return `exports/${projectId}/${interviewIds.join('-')}/${getStoredFileFilename(
        filename,
        fields,
        language
    )}`;
};

const storeExportFile = async (projectId, interviewIds, filename, language, fields, data) => {
    const bucket = storage().bucket(`gs://${config.storage.url}`);
    const file = bucket.file(
        getStoredFilePath(projectId, interviewIds, filename, language, fields)
    );

    await file.save(data, {
        gzip: true,
        predefinedAcl: 'authenticatedRead'
    });
};

const getStoredExportFileUrl = async (projectId, interviewIds, filename, language, fields) => {
    const bucket = storage().bucket(`gs://${config.storage.url}`);
    const file = bucket.file(
        getStoredFilePath(projectId, interviewIds, filename, language, fields)
    );
    const fileExists = await file.exists();

    // Not sure why but this is returned as an array...
    if (fileExists[0]) {
        // Allow access for 10 minutes only
        const expires = Date.now() + 10 * 60;
        const url = await file.getSignedUrl({action: 'read', expires});

        return url?.[0] || '';
    }
};

const getResponseAnswers = (response, questions, primaryLanguage, requestedLanguage) => {
    const formattedAnswers = Object.keys(response.answers).reduce((acc, key) => {
        const translatedQuestion = getQuestionTranslations(
            response.answers[key].question,
            questions,
            primaryLanguage,
            requestedLanguage
        );

        // Add in the translated question titles for each response/question
        return {
            ...acc,
            [key]: {
                ...response.answers[key],
                question: {
                    ...response.answers[key].question,
                    options: translatedQuestion?.options?.[requestedLanguage],
                    title: translatedQuestion.title[requestedLanguage]
                }
            }
        };
    }, {});

    return formattedAnswers;
};

const getCachedReportData = async (projectId, interviewId, language = 'data') => {
    const bucket = storage().bucket(`gs://${config.storage.url}`);
    const file = bucket.file(`reports/${projectId}/${interviewId}/${language}.json`);
    const fileExists = await file.exists();

    // Not sure why but this is returned as an array...
    if (fileExists[0]) {
        const data = await file.download();

        return JSON.parse(data.toString());
    } else {
        console.log('file does not exist');
    }
};

exports.returnCachedReportData = functions
    .runWith({timeoutSeconds: 540, memory: '4GB'})
    .https.onRequest(async (req, res) => {
        if (!req.query.projectId || !req.query.interviewId || !req.query.key) {
            return res.send({error: 'params missing'});
        } else if (req.query.key !== config.admin.api_key) {
            return res.send({error: 'unauthorised'});
        }

        try {
            // Fix CORS issue from Vercel API's redirect to here
            res.set('Access-Control-Allow-Origin', '*');

            const interviewId = req.query?.interviewId;
            const projectId = req.query?.projectId;
            const language = req.query?.language;

            // const userFromToken = await validateFirebaseIdToken(req.query.token);
            // if (!userFromToken?.email) {s
            //     throw new Error('Please login again');
            // }

            const cachedReportData = await getCachedReportData(projectId, interviewId, language);

            if (cachedReportData) {
                // Some reports exceed Vercel's API response limit. Instead of returning the data
                // we need to redirect to a Firebase Function that will return the data instead.
                return res.send(cachedReportData);
            } else {
                return res.send({error: 'no report found'});
            }
        } catch (error) {
            logger.error(error);
            res.send(error?.message);
        }
    });

exports.exportInterviewResponsesToFile = functions
    .runWith({timeoutSeconds: 540, memory: '4GB'})
    .https.onRequest(async (req, res) => {
        if (
            !req.query.projectId ||
            !req.query.interviewIds ||
            !req.query.title ||
            !req.query.token ||
            !req.query.key
        ) {
            return res.send({error: 'params missing'});
        } else if (req.query.key !== config.admin.api_key) {
            return res.send({error: 'unauthorised'});
        }

        const interviewIds = req.query?.interviewIds.split(',');
        const projectId = req.query?.projectId;
        const redirectUrl = `${req.query?.redirectUrl}/projects/${projectId}/interviews/${interviewIds[0]}/report`;

        try {
            // TODO: Disable below until fixed
            const user = {
                email: '-',
                first_name: '-',
                last_name: '-',
                uid: '-'
            };

            // const userFromToken = await validateFirebaseIdToken(req.query.token);
            // if (!userFromToken?.email) {
            //     throw new Error('Please login again');
            // }
            // const user = {
            //     email: userFromToken.email,
            //     first_name: '-',
            //     last_name: '-',
            //     uid: userFromToken.uid
            // };

            const exportType = req.query?.type || 'excel';
            const title = req.query?.title;
            const language = req.query?.language;
            const primaryLanguage = req.query?.primary_language;
            const filters = {exclude: req?.query?.exclude};

            // Return a saved file if it exists
            const filename = getFilename(kebabCase(title), exportType);
            const fileOptions = [projectId, interviewIds, filename, language, filters.exclude];
            const savedFileUrl = await getStoredExportFileUrl(...fileOptions);

            if (savedFileUrl) {
                return res.redirect(savedFileUrl);
            }

            /**
             * Fetch each interview, then for each interview fetch all responses.
             */
            const interviewsRef = firestore
                .collection('projects')
                .doc(projectId)
                .collection('interviews')
                .where(admin.firestore.FieldPath.documentId(), 'in', interviewIds);
            const interviewsSnapshot = await interviewsRef.get();

            const reportData = await Promise.all(
                interviewsSnapshot.docs.map(async interviewDoc => {
                    const docData = interviewDoc.data();
                    const interviewRef = firestore
                        .collection('projects')
                        .doc(projectId)
                        .collection('interviews')
                        .doc(interviewDoc.id);
                    const responsesRef = interviewRef.collection('responses');

                    const responses = await firestore.runTransaction(async transaction => {
                        const responsesDocs = await transaction.get(responsesRef);
                        const responsesData = responsesDocs.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data()
                        }));

                        if (responsesData.length) {
                            const responseQuestionsRef = await interviewRef
                                .collection('questions')
                                .where('is_archived', '==', false)
                                .where('interview.id', '==', interviewDoc.id);
                            const responseQuestions = await transaction.get(responseQuestionsRef);
                            const responseQuestionsData = responseQuestions.docs.map(doc => ({
                                id: doc.id,
                                ...doc.data()
                            }));

                            const formattedResponses = responsesData.map(response => ({
                                ...response,
                                answers: response.answers
                                    ? getResponseAnswers(
                                          response,
                                          responseQuestionsData,
                                          docData.primary_language,
                                          language
                                      )
                                    : {}
                            }));

                            return formattedResponses;
                        } else {
                            return responsesData;
                        }
                    });

                    return {
                        interview: {
                            id: interviewDoc.id,
                            title: docData.title
                        },
                        responses
                    };
                })
            );

            /**
             * If we found responses we can generate the formatted data for export.
             */
            if (reportData) {
                const reportExport = createExport(reportData, filters, language, primaryLanguage);

                if (reportExport) {
                    await firestore.collection('activities').add({
                        action:
                            interviewIds.length > 1
                                ? 'Exported a project report'
                                : 'Exported an interview report',
                        info: {project_id: projectId, interview_ids: interviewIds},
                        ip: getIp(req),
                        type: 'Export',
                        created_at: admin.firestore.FieldValue.serverTimestamp(),
                        created_by: {
                            first_name: user.first_name,
                            last_name: user.last_name,
                            id: user.uid
                        }
                    });

                    const exportFile = await getExportFile(exportType, reportExport, user);

                    if (exportFile) {
                        const save = await storeExportFile(...fileOptions, exportFile);
                        const url = await getStoredExportFileUrl(...fileOptions);

                        if (url) {
                            return res.redirect(url);
                        } else {
                            redirectBackToReport(res, redirectUrl, 'Error retrieving file URL');
                        }
                    } else {
                        redirectBackToReport(res, redirectUrl, 'Error generating the report data');
                    }
                } else {
                    redirectBackToReport(res, redirectUrl, 'No export found for report');
                }
            } else {
                redirectBackToReport(res, redirectUrl, 'No data found for report');
            }
        } catch (error) {
            logger.error(error);
            redirectBackToReport(res, redirectUrl, error?.message);
        }
    });

exports.deleteExpiredReportFile = functions.storage.object().onDelete(async object => {
    const {name} = object;

    await firestore.collection('activities').add({
        action: 'Deleted an expired report export file',
        info: {name},
        type: 'System',
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        created_by: 'system'
    });
});
