import fpMap from 'lodash/fp/map';
import filter from 'lodash/filter';
import findIndex from 'lodash/findIndex';
import flatMap from 'lodash/flatMap';
import flow from 'lodash/fp/flow';
import groupBy from 'lodash/fp/groupBy';
import map from 'lodash/map';
import omit from 'lodash/omit';
import sortBy from 'lodash/sortBy';
import type {Question} from '@/types/question';
import type {ReportQuestion, Report} from '@/types/report';
import type {Response} from '@/types/response';
import {getFixedPercent, getMedian, pluralise} from '@/utils/helpers';

//@ts-ignore
const fpMapConverted = fpMap.convert({cap: false});

const sortQuestionOptions = (questions: ReportQuestion[]) => {
    const sortedQuestions = questions.map(question => {
        const options_selected: ReportQuestion['options_selected'] = [];

        Object.keys(question.options_selected).map(option => {
            options_selected.push({
                title: option,
                count: question.options_selected[option].count
            });
        });

        return {...question, options_selected};
    });

    return sortedQuestions;
};

const getQuestionsAndAnswers = (questionsData: Question[], responses: Response[]) => {
    const openResponses = {};
    const openResponsesOrdered = {};
    const flaggedQuestions = {};
    const ignoredQuestions = {};
    const probingQuestions = {};
    const skippedQuestions = {};
    const starredQuestions = {};
    const questionsByOrder = [];

    // Prepare totals and info for each question.
    const questions = questionsData.map(question => {
        const options_selected = {};

        question.options.forEach((option, index) => {
            // We store the order here so we can retain the order in the UI.
            // Firebase will not return the same order each time.
            options_selected[option] = {
                count: 0,
                order: index + 1
            };
        });

        // This will help us associate probing questions later.
        questionsByOrder[question.order / 100] = question.title;

        return {
            id: question.id,
            number: question.order / 100,
            options_selected,
            title: question.title,
            total_answers: 0,
            total_ignores: 0,
            total_flags: 0,
            total_skips: 0,
            total_stars: 0,
            type: question.type
        };
    });

    // Each response includes all answers.
    responses.forEach(response => {
        // For each answer we'll need to set the actual answer, flagged, skipped, etc. counts.
        Object.keys(response.answers).forEach(questionId => {
            const answer = response.answers[questionId];
            const questionIndex = findIndex(questions, q => q.id === questionId);
            let question;
            let isProbingQuestion = false;

            if (questionIndex >= 0) {
                // If there is a question defined for our answer's question, then this is not a probing question.
                question = questions[questionIndex];
            } else {
                // Otherwise we'll need to create a probing question template.
                isProbingQuestion = true;
                question = {
                    id: questionId,
                    number: answer.order / 100,
                    title: answer.question.title,
                    total_answers: 0,
                    total_ignores: 0,
                    total_flags: 0,
                    total_skips: 0,
                    total_stars: 0,
                    type: 'free_text'
                };
            }

            // Update the flagged answers. We can use the IDs to show a list of all
            // flagged responses as well as a count.
            if (answer.is_flagged) {
                question.total_flags++;

                if (!flaggedQuestions[question.id]) {
                    flaggedQuestions[question.id] = [];
                }

                flaggedQuestions[question.id].push({
                    answer: answer.answers.join(', '),
                    id: response.id,
                    question: question.title
                });
            }

            // Update the starred answers. We can use the IDs to show a list of all
            // starred responses as well as a count.
            if (answer.is_starred) {
                question.total_stars++;

                if (!starredQuestions[question.id]) {
                    starredQuestions[question.id] = [];
                }

                starredQuestions[question.id].push({
                    answer: answer.answers.join(', '),
                    id: response.id,
                    question: question.title
                });
            }

            // Skipped answers are not being set correctly. For now, we can
            // assume that if there is no answer on a question it has been skipped.
            if (answer.is_skipped || !answer.answers.length) {
                if (answer?.is_skipped_by_skip_logic) {
                    question.total_ignores++;

                    // Update the ignored answers. We can use the IDs to show a list of all
                    // skipped responses as well as a count.
                    if (!ignoredQuestions[question.id]) {
                        ignoredQuestions[question.id] = [];
                    }

                    ignoredQuestions[question.id].push({
                        id: response.id,
                        question: question.title
                    });
                } else {
                    question.total_skips++;

                    // Update the skipped answers. We can use the IDs to show a list of all
                    // skipped responses as well as a count.
                    if (!skippedQuestions[question.id]) {
                        skippedQuestions[question.id] = [];
                    }

                    skippedQuestions[question.id].push({
                        id: response.id,
                        question: question.title
                    });
                }
            } else {
                // For single and multi-code questions, update how many times
                // an option was selected.
                if (question.type !== 'free_text') {
                    // Support both translated and non-translated responses.
                    let answersKey = 'original_answers';

                    if (!answer.original_answers.length && answer.answers.length) {
                        answersKey = 'answers';
                    }

                    answer[answersKey].forEach((option, index) => {
                        question.total_answers++;
                        if (question && question.options_selected) {
                            if (!question.options_selected[option]) {
                                question.options_selected[option] = {
                                    count: 0
                                };
                            }

                            question.options_selected[option].count++;
                        }
                    });
                } else {
                    question.total_answers++;

                    if (!openResponses[question.id]) {
                        openResponses[question.id] = {};
                        openResponsesOrdered[question.id] = [];
                    }

                    openResponses[question.id][response.id] = {
                        answer: answer.answers[0],
                        id: response.id,
                        is_flagged: answer?.is_flagged || false,
                        is_proofed: answer.is_proofed,
                        is_starred: answer?.is_starred || false,
                        is_translated: answer?.is_translated || false,
                        original_answer: answer.original_answers?.[0] || '',
                        proofed_at: answer?.proofed_at || '',
                        proofed_by: answer?.proofed_by || '',
                        transcribed_answer: answer?.transcribed_answer || '',
                        used_transcription: answer?.used_transcription || false
                    };
                    openResponsesOrdered[question.id].push(response.id);
                }
            }

            // If this is a probing question then add to the list. Otherwise, update questions array
            // with the new data from the response and answers.
            if (isProbingQuestion) {
                const parentQuestionNumber = Math.floor(answer.question.order / 100) + 1;
                const probingQuestionParent = questions.find(
                    q => q.number === parentQuestionNumber
                );

                if (probingQuestionParent) {
                    const probingQuestionParentId = probingQuestionParent.id;

                    if (!probingQuestions[probingQuestionParentId]) {
                        probingQuestions[probingQuestionParentId] = {};
                    }

                    probingQuestions[probingQuestionParentId][question.id] = {
                        ...question,
                        parent_question_number: parentQuestionNumber
                    };
                }
            } else {
                questions[questionIndex] = question;
            }
        });
    });

    const sortedQuestions = sortBy(questions, r => r.number);
    // @ts-ignore
    const questionsWithSortedOptions = sortQuestionOptions(sortedQuestions);

    return {
        flaggedQuestions,
        ignoredQuestions,
        openResponses,
        openResponsesOrdered,
        probingQuestions,
        questions: questionsWithSortedOptions,
        skippedQuestions,
        starredQuestions
    };
};

// MVP Multi-lang support.
// TODO: This should be an enum instead of string.
const genderMatches = {
    male: ['male', 'ذكر', 'masculino', 'homme'],
    female: ['female', 'أنثى', 'mujer', 'femme'],
    other: ['other', 'أخرى', 'otro', 'autre']
};

type GenderType = keyof typeof genderMatches;

const isGenderMatch = (type: GenderType, gender: string) => {
    return (
        genderMatches[type].includes(gender) || genderMatches[type].includes(gender.toLowerCase())
    );
};

const getGendersCount = (responses: Response[]): Report['genders_count'] => {
    return {
        male: responses.filter(r => isGenderMatch('male', r.gender)).length,
        female: responses.filter(r => isGenderMatch('female', r.gender)).length,
        other: responses.filter(r => isGenderMatch('other', r.gender)).length
    };
};

const getGendersPercent = (
    genders_count: Report['genders_count'],
    totalRespondents: number
): Report['genders_percent'] => {
    return {
        male: getFixedPercent((genders_count.male / totalRespondents) * 100),
        female: getFixedPercent((genders_count.female / totalRespondents) * 100),
        other: getFixedPercent((genders_count.other / totalRespondents) * 100)
    };
};

const getAverageDuration = (dates: {end_time: number; start_time: number}[]) => {
    const durations = dates.map(d => d.end_time - d.start_time);
    const sum = durations.reduce((a, b) => a + b, 0);
    const average = sum / durations.length || 0;

    return average;
};

const getMedianDuration = (dates: {end_time: number; start_time: number}[]) => {
    const durations = dates.map(d => d.end_time - d.start_time);
    const median = getMedian(durations);

    return median;
};

const getBeneficiariesPercent = (responses: Response[]) => {
    const beneficiaries = responses.filter(r => r.is_beneficiary);
    const percent = (beneficiaries.length / responses.length) * 100;

    return getFixedPercent(percent);
};

const getAdditionalConsentPercent = (responses: Response[]) => {
    // Relationships are only tracked when added consent is required.
    const additionalConsent = responses.filter(r => r.consent_relationship);
    const percent = (additionalConsent.length / responses.length) * 100;

    return getFixedPercent(percent);
};

const getTotalCount = (collection: Object[], key: string) => {
    const count = collection.map(item => item[key]).reduce((a, b) => a + b, 0);

    return count;
};

const getTime = (time: any): number => {
    if (time.hasOwnProperty('_seconds')) {
        return time._seconds * 1000;
    } else {
        return new Date(time).getTime();
    }
};

const getEnumeratorNotes = (responses: Response[]) => {
    return responses
        .filter(i => i.enumerator_notes?.text)
        .reduce((acc, c) => ({...acc, [c.id]: c.enumerator_notes}), {});
};

const formatSkippedQuestions = (responses, questions, language, type = 'Skipped') => {
    if (!responses) {
        return;
    }

    // If the requested language is not available we'll need to fallback to
    // the first available language
    if (!questions[0].translations?.[language]) {
        language = Object.keys(questions[0].title)[0];
    }

    const questionIdsByTitle = questions.reduce((acc, cur) => {
        return {...acc, [cur.title[language]]: cur.id};
    }, {});

    const skippedResponses = Object.keys(responses).map(responseKey => {
        const _responses = responses[responseKey];
        const response = flow(
            groupBy('question'),
            fpMapConverted((items, question) => ({count: items.length, question}))
        )(_responses);

        return {
            id: questionIdsByTitle[response[0].question],
            answer: response[0].question,
            total: response[0].count
        };
    });
    const formattedSkippedResponses = skippedResponses.reduce((acc, response) => {
        if (!response?.id) return acc;

        return {
            ...acc,
            [response.id.toString()]: {
                answer: response.answer,
                total: response.total
            }
        };
    }, {});

    return formattedSkippedResponses;
};

export const getQuestionTranslations = (
    question,
    allQuestions,
    primary_language,
    requested_language
) => {
    const questionData = allQuestions.find(q => q.id === question.id);

    // First, create a new question title object for the primary language if it hasn't been already.
    if (typeof question.title === 'string') {
        question.title = {[primary_language]: question.title};
    }

    // If the question includes translations for the requested language, add it!
    if (
        // primary_language !== requested_language &&
        questionData &&
        Object.keys(questionData?.translations || {}).includes(requested_language)
    ) {
        question.title[requested_language] =
            questionData.translations[requested_language].title || question.title;

        // if the question has options, translate those too
        if (question.options_selected) {
            question.options_selected = question.options_selected.map((option, index) => {
                return {
                    ...option,
                    title: {
                        [primary_language]: option.title,
                        [requested_language]:
                            questionData.translations[requested_language].options[index]
                    }
                };
            });
        }
    }

    return question;
};

const getTranslatedQuestions = (
    allQuestions: any[],
    questions: Question[],
    primary_language,
    requested_language
) => {
    const translatedAllQuestions = allQuestions.map(q => {
        return getQuestionTranslations(q, allQuestions, primary_language, requested_language);
    });

    return translatedAllQuestions;
};

const getTranslatedQuestionsAndAnswers = (
    questionsAndAnswers: any,
    questions: Question[],
    primary_language,
    requested_language
) => {
    const translatedQuestions = questionsAndAnswers.questions.map(q => {
        return getQuestionTranslations(q, questions, primary_language, requested_language);
    });

    return {
        ...questionsAndAnswers,
        questions: translatedQuestions
    };
};

const createReport = (
    responses: Response[],
    questions: Question[],
    primary_language: string,
    requested_language: string
) => {
    const formattedResponses = getTranslatedQuestionsAndAnswers(
        getQuestionsAndAnswers(questions, responses),
        questions,
        primary_language,
        requested_language
    );

    // Convert Firebase timestamp seconds to milliseconds.
    const dates = responses.map(r => ({
        end_time: getTime(r.end_time),
        start_time: getTime(r.start_time)
    }));
    const start_date = dates
        .map(d => d.start_time)
        .sort()
        .reverse()[0];
    const end_date = dates.map(d => d.end_time).sort()[0];
    const respondents_count = responses.length;
    const genders_count = getGendersCount(responses);
    const genders_percent = getGendersPercent(genders_count, respondents_count);
    const average_duration = getMedianDuration(dates);
    const beneficiaries_percent = getBeneficiariesPercent(responses);
    const additional_consent_percent = getAdditionalConsentPercent(responses);
    const enumerator_notes = getEnumeratorNotes(responses);

    const questionsAndProbingQuestions = getTranslatedQuestions(
        [
            ...formattedResponses.questions,
            ...flatMap(map(formattedResponses.probingQuestions, q => flatMap(q)))
        ],
        questions,
        primary_language,
        requested_language
    );
    const total_ignores_count = getTotalCount(formattedResponses.questions, 'total_ignores');
    const total_skips_count = getTotalCount(formattedResponses.questions, 'total_skips');
    const total_flags_count = getTotalCount(questionsAndProbingQuestions, 'total_flags');
    const total_stars_count = getTotalCount(questionsAndProbingQuestions, 'total_stars');

    // We can determine languages by the translations in questions.
    const languages = Object.keys(formattedResponses.questions[0].title) || [primary_language];

    const report = {
        ...formattedResponses,
        enumerator_notes,
        start_date,
        end_date,
        respondents_count,
        genders_count,
        genders_percent,
        average_duration,
        beneficiaries_percent,
        additional_consent_percent,
        skippedQuestions: formatSkippedQuestions(
            formattedResponses.skippedQuestions,
            questionsAndProbingQuestions,
            requested_language
        ),
        ignoredQuestions: formatSkippedQuestions(
            formattedResponses.ignoredQuestions,
            questionsAndProbingQuestions,
            requested_language,
            'Ignored'
        ),
        total_ignores_count,
        total_flags_count,
        total_skips_count,
        total_stars_count,
        languages
    };

    // return report;

    // TODO: Figure out the max size allowed for report answers to be stored.
    // For now, we'll limit to 30 questions and 200 responses.
    const maxDataSize = 20; // 200;
    const reportDataSize = Object.keys(report.openResponses).length; // questions.length;

    if (reportDataSize > maxDataSize) {
        return omit(report, ['openResponses', 'openResponsesOrdered']);
    } else {
        return report;
    }
};

export default createReport;
