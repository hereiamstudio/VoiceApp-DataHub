import dayjs from 'dayjs';
import sortBy from 'lodash/sortBy';
import {parse as json2csv} from 'json2csv';
import ExcelJS from 'exceljs';
import {humanise} from '@/utils/helpers';
import type {Timestamp} from '@/types/firebase';
import type {Response} from '@/types/response';

type FileType = 'csv' | 'excel';

interface ReportData {
    interview: {
        id: string;
        title: string;
    };
    responses: Response[];
}

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

const isKeyExcluded = (key, excludeKeys) => {
    const matchKeys = {
        ignored: key => key === 'Ignored',
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

const getResponseTitle = (isSkipped, isCodedQuestion, questionOptions) => {
    if (isSkipped) return '';

    return isCodedQuestion
        ? questionOptions.map((option, index) => `${index + 1}. ${option}`).join(' / ')
        : '';
};

const getResponseAnswer = (isSkipped, isCodedQuestion, answers, options) => {
    if (isSkipped) return '';

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

const getQuestionOptionSelected = (isSkipped, option, answers) => {
    if (isSkipped) return '';

    return answers.includes(option) ? 1 : 0;
};

const getFormattedResponses = (responses, filters, requestedLanguage, primaryLanguage) => {
    const formattedResponses = responses
        .map(response => {
            const formattedResponse = {
                Project: response?.project?.title || '',
                Interview: response?.interview?.title || '',
                'Interview language': requestedLanguage || primaryLanguage,
                Age: response.age,
                Gender: response.gender,
                ['Beneficiary']: response.is_beneficiary ? 1 : 0,
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
                    const title = `${answerIndex + 1}. ${answer?.question?.title || ''}`;
                    const number = (answer.order || answer.question.order) / 100;
                    const isCodedQuestion = answer.question.type !== 'free_text';
                    const {answers, is_skipped, original_answers, question} = answer;

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
                        isCodedQuestion,
                        requestedLanguage !== 'en' ? original_answers : answers,
                        question.options
                    );

                    if (!isCodedQuestion) {
                        formattedResponse[`${title} / Original answer`] = getResponseAnswer(
                            is_skipped,
                            isCodedQuestion,
                            original_answers,
                            question.options
                        );
                    }

                    if (isCodedQuestion) {
                        question.options?.map((option, index) => {
                            formattedResponse[`${title} / ${index + 1}. ${option}`] =
                                getQuestionOptionSelected(is_skipped, option, original_answers);
                        });
                    }

                    formattedResponse[`${title} / Skipped`] = answer.is_skipped ? 1 : 0;
                    formattedResponse[`${title} / Proofed`] =
                        !answer.is_translated && answer.is_proofed ? 1 : 0;
                    formattedResponse[`${title} / Flagged`] = answer.is_flagged ? 1 : 0;
                    formattedResponse[`${title} / Starred`] = answer.is_starred ? 1 : 0;
                    formattedResponse[`${title} / Translated`] = answer.is_translated ? 1 : 0;
                    formattedResponse[`${title} / Used transcription`] = answer.used_transcription
                        ? 1
                        : 0;
                }
            );

            return formattedResponse;
        })
        .map(response => filterResponse(response, filters));
    console.log(formattedResponses);
    return formattedResponses;
};

const getExportContent = (interviews, filters, requestedLanguage, primaryLanguage): Response[] => {
    const formattedResponses = interviews.map(interview =>
        getFormattedResponses(interview.responses, filters, requestedLanguage, primaryLanguage)
    );

    return formattedResponses;
};

const generateCsv = async (reports: any[]) => {
    // CSV exports cannot contain multiple reports, simply take the first from the list.
    const firstInterview = reports[0];
    const csv = json2csv(firstInterview);

    // The UTF BOM is used to fix encoding issues with Arabic characters (and others, no doubt)
    // https://stackoverflow.com/questions/19492846/javascript-to-csv-export-encoding-issue
    const csvAndBOM = `${csv}\uFEFF`;

    return csvAndBOM;
};

const generateExcel = async (reports: any[], user) => {
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
                    header: humanise(key),
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

const getExportFile = async (type: FileType, report: any, user: any) => {
    const generators = {
        csv: generateCsv,
        excel: generateExcel
    };
    const fileContent = await generators[type](report, user);

    return fileContent;
};

const getFilename = (title: string, type: FileType) => {
    const extensions = {
        excel: 'xlsx',
        csv: 'csv'
    };

    return `${encodeURIComponent(title)}.${extensions[type]}`;
};

const createExport = {
    getContent: getExportContent,
    getFile: getExportFile,
    getFilename
};

export default createExport;
