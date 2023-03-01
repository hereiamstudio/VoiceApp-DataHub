import React, {memo, useContext} from 'react';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import Divider from '@/components/Divider';
import ProgressBar from '@/components/ProgressBar';
import {ReportContext} from '@/components/Interviews/Report';
import Stack from '@/components/Stack';
import strings from '@/locales/en.json';
import {pluralise} from '@/utils/helpers';
import {QUESTION_TYPES} from '@/utils/questions';
import type {ReportSkippedQuestion, ReportQuestion} from '@/types/report';

interface Props {
    allOpenResponsesOrdered: Object;
    allOpenResponses: Object;
    flagged: Partial<ReportQuestion>;
    handleShowResponses: Function;
    ignored: ReportSkippedQuestion;
    probingQuestions: Partial<ReportQuestion>;
    question: Partial<ReportQuestion>;
    skipped: ReportSkippedQuestion;
    starred: Partial<ReportQuestion>;
}

const ReportQuestionResponseSummary: React.FC<Props> = ({
    allOpenResponses,
    allOpenResponsesOrdered = {},
    flagged = {},
    handleShowResponses,
    ignored,
    probingQuestions = {},
    question,
    skipped,
    starred = {}
}: Props) => {
    const {language} = useContext(ReportContext);
    const openResponses = allOpenResponses?.[question.id] || {};
    const openResponsesOrdered = allOpenResponsesOrdered?.[question.id];
    const openResponsesCount = Object.keys(openResponses).length || question.total_answers;
    const probingQuestionsCount = Object.keys(probingQuestions).length;
    const flaggedCount = Object.keys(flagged).length;
    const ignoredCount = ignored?.total || 0;
    const skippedCount = skipped?.total || 0;
    const starredCount = Object.keys(starred).length;

    return (
        <section className="w-full overflow-hidden rounded-lg bg-white shadow">
            <div className="w-full px-4 py-5 shadow sm:p-6">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                        <h4 className="sm:text-md mb-1 text-sm font-normal leading-6 text-gray-500">
                            {strings.reportsList.question}{' '}
                            {question.number < 1 ? question.number * 100 : question.number}
                            <span className="px-2">•</span>
                            {QUESTION_TYPES[question.type]}
                        </h4>

                        <p className="text-md mb-4 font-semibold leading-6 text-gray-900 sm:text-xl sm:leading-7">
                            {question.title[language]}
                        </p>

                        {(skippedCount > 0 ||
                            flaggedCount > 0 ||
                            starredCount > 0 ||
                            ignoredCount > 0) && (
                            <Stack direction="horizontal" size={2}>
                                {skippedCount > 0 && (
                                    <Badge hasBorder={false} icon="skip" theme="yellow">
                                        {strings.reportsList.stats.skipped} {skippedCount}{' '}
                                        {pluralise(
                                            skippedCount as number,
                                            strings.reportsList.stats.times
                                        )}
                                    </Badge>
                                )}
                                {ignoredCount > 0 && (
                                    <Badge hasBorder={false} icon="branching" theme="blue">
                                        {strings.reportsList.stats.ignored} {ignoredCount}{' '}
                                        {pluralise(ignoredCount, strings.reportsList.stats.times)}
                                    </Badge>
                                )}
                                {starredCount > 0 && (
                                    <Badge hasBorder={false} icon="star" theme="orange">
                                        {strings.reportsList.stats.starred} {starredCount}{' '}
                                        {pluralise(starredCount, strings.reportsList.stats.times)}
                                    </Badge>
                                )}
                                {flaggedCount > 0 && (
                                    <Badge hasBorder={false} icon="flag" theme="red">
                                        {strings.reportsList.stats.flagged} {flaggedCount}{' '}
                                        {pluralise(flaggedCount, strings.reportsList.stats.times)}
                                    </Badge>
                                )}
                            </Stack>
                        )}
                    </div>
                    <div className="sm:col-span-3">
                        {question.type !== 'free_text' && question.options_selected ? (
                            <div className="rounded-lg border border-gray-200 p-4 sm:p-6">
                                {question.options_selected.map((option, index) => (
                                    <div
                                        key={option.title[language] || option.title}
                                        className={
                                            index < question.options_selected.length - 1
                                                ? 'mb-2 sm:mb-3'
                                                : ''
                                        }
                                    >
                                        <div className="mb-1 flex justify-between text-sm font-light leading-6 text-gray-600">
                                            <strong>
                                                {option.title[language] || option.title}
                                            </strong>{' '}
                                            {option.count}
                                        </div>

                                        <ProgressBar
                                            percent={(option.count / question.total_answers) * 100}
                                            theme="orange"
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="sm:mt-4 sm:text-right">
                                <Button
                                    onClick={() => {
                                        handleShowResponses({
                                            question: {
                                                id: question.id,
                                                number: `Question ${question.number}`,
                                                title: question.title
                                            },
                                            responses: openResponses,
                                            responsesOrdered: openResponsesOrdered
                                        });
                                    }}
                                >
                                    {strings.reportsList.responsesCta}
                                    <span className="mr-2" />
                                    <Badge hasBorder={false} type="number">
                                        {openResponsesCount || question.total_answers}
                                    </Badge>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {probingQuestionsCount > 0 && (
                <>
                    <div className="w-full border-t border-gray-100 bg-gray-50 px-4 py-5 sm:p-6">
                        <h4 className="sm:text-md mb-2 text-sm font-normal leading-6 text-gray-500">
                            {probingQuestionsCount} {strings.reportsList.probing}
                        </h4>

                        {Object.keys(probingQuestions).map((probingQuestionId, index) => {
                            const probingQuestion = probingQuestions[probingQuestionId];

                            return (
                                <div key={probingQuestion.id}>
                                    <div className="justify-betweem items-center sm:flex">
                                        <p className="text-md flex-grow font-medium leading-6 text-gray-900">
                                            {probingQuestion.title[language]}
                                        </p>

                                        <Button
                                            onClick={() => {
                                                handleShowResponses({
                                                    question: {
                                                        id: probingQuestion.id,
                                                        number: probingQuestion.parent_question_number
                                                            ? `Question ${probingQuestion.parent_question_number} • Probing question`
                                                            : null,
                                                        title: probingQuestion.title[language]
                                                    },
                                                    responses:
                                                        allOpenResponses?.[probingQuestion.id],
                                                    responsesOrdered:
                                                        allOpenResponsesOrdered?.[
                                                            probingQuestion.id
                                                        ]
                                                });
                                            }}
                                        >
                                            View probing question responses
                                            <span className="mr-2" />
                                            <Badge hasBorder={false} type="number">
                                                {probingQuestion.total_answers}
                                            </Badge>
                                        </Button>
                                    </div>

                                    {index < probingQuestionsCount - 1 && (
                                        <Divider paddingVertical="xs" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </section>
    );
};

export default memo(ReportQuestionResponseSummary);
