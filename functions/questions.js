const functions = require('firebase-functions');
const logger = require('firebase-functions/lib/logger');
const admin = require('firebase-admin');
const {Translate} = require('@google-cloud/translate').v2;

if (!admin.apps.length) {
    admin.initializeApp();
}

/*
 * We are running this code in the Cloud Functions environment so we don't
 * have to provide any configuration, it's detected automatically from the
 * environment it runs in.
 */
const firestore = admin.firestore();

const getTranslatedStrings = async (string, lang) => {
    const translate = new Translate();
    let [translations] = await translate.translate(string, lang);

    return Array.isArray(translations) ? translations : [translations];
};

const handleQuestionTranslations = async (params, question, prevQuestion) => {
    try {
        const TRANSLATION_LANG = 'en';

        // We first have to retrieve the primary language for the parent interview
        const interview = await firestore
            .collection('projects')
            .doc(params.projectId)
            .collection('interviews')
            .doc(params.interviewId)
            .get();
        const interviewData = interview.data();

        // Only non-English interviews need to be updated. If there is no language
        // then it's English and we don't need to do anything.
        if (
            !interviewData.primary_language ||
            interviewData.primary_language === TRANSLATION_LANG
        ) {
            return;
        }

        // New questions don't need to be compared, but updated questions should have
        // their translatable strings checked.
        if (prevQuestion) {
            const doesDescriptionMatch = question.description === prevQuestion.description;
            const doesOptionsMatch = question.options.join('') === prevQuestion.options.join('');
            const doesTitleMatch = question.title === prevQuestion.title;

            // If no translatable fields have changed then we don't need to do anything.
            if (doesDescriptionMatch && doesOptionsMatch && doesTitleMatch) {
                return;
            }
        }

        // Send strings as an array to reduce API calls.
        // 0 - title
        // 1 - description
        // 2... - options
        const translatableStrings = [
            question.title,
            question.description,
            ...(question.options && question.options.length ? question.options : [])
        ];
        const [translatedTitle, translatedDescription, ...translatedOptions] =
            await getTranslatedStrings(translatableStrings, TRANSLATION_LANG);

        const docRef = firestore
            .collection('projects')
            .doc(params.projectId)
            .collection('interviews')
            .doc(params.interviewId)
            .collection('questions')
            .doc(params.questionId)
            .update({
                is_translated: true,
                languages: [interviewData.primary_language, TRANSLATION_LANG],
                primary_language: interviewData.primary_language,
                translations: {
                    [TRANSLATION_LANG]: {
                        description: translatedDescription,
                        options: translatedOptions,
                        title: translatedTitle
                    },
                    [interviewData.primary_language]: {
                        description: question.description,
                        options: question.options,
                        title: question.title
                    }
                }
            });
    } catch (error) {
        logger.error(error);
    }
};

exports.handleQuestionCreate = functions.firestore
    .document('/projects/{projectId}/interviews/{interviewId}/questions/{questionId}')
    .onCreate(async (snapshot, context) => {
        await handleQuestionTranslations(context.params, snapshot.data());

        return 'complete';
    });

exports.handleQuestionUpdate = functions.firestore
    .document('/projects/{projectId}/interviews/{interviewId}/questions/{questionId}')
    .onUpdate(async (change, context) => {
        await handleQuestionTranslations(context.params, change.after.data(), change.before.data());

        return 'complete';
    });
