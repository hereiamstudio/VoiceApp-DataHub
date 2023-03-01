import React, {useContext} from 'react';
import useSWR from 'swr';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import APIView from '@/components/APIView';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import ModalContext from '@/components/Modal/context';
import Pagination from '@/components/Pagination';
import usePagination from '@/components/Pagination/usePagination';
import QuestionsExportModal from '@/components/QuestionsExportModal';
import SEO from '@/components/SEO';
import Table from '@/components/Table';
import strings from '@/locales/en.json';
import {QUESTION_TYPES} from '@/utils/questions';

dayjs.extend(relativeTime);

interface Props {
    interview: any;
    interviewId: string;
    isLocked: boolean;
    project: any;
    projectId: string;
}

const QuestionsList: React.FC<Props> = ({interview, interviewId, isLocked, projectId}: Props) => {
    const {showModal} = useContext(ModalContext);
    const {currentPage, handlePageNext, handlePagePrevious, itemsOffset, itemsPerPage} =
        usePagination({itemsPerPage: 100});
    const {data: allQuestions, error} = useSWR(
        projectId && interviewId
            ? `/api/questions?projectId=${projectId}&interviewId=${interviewId}&limit=${itemsPerPage}&offset=${itemsOffset}`
            : null
    );

    const questionLanguages = allQuestions?.length
        ? (Array.from(
              new Set(
                  allQuestions
                      .filter(question => question.data.languages)
                      .flatMap(question => question.data.languages)
              )
          ) as string[])
        : [];

    return (
        <>
            <SEO title={strings.questionsList.title} />

            {interview && allQuestions?.length > 0 && (
                <QuestionsExportModal
                    defaultLanguage={interview?.primary_language || 'en'}
                    interviewId={interviewId?.toString()}
                    languages={questionLanguages}
                    projectId={projectId?.toString()}
                    title={`${interview.project.title} - ${interview.title} - All questions export`}
                />
            )}

            <div className="mb-6 flex sm:justify-end">
                <div className="items-center space-x-4 md:flex">
                    {/* {report?.languages?.length > 1 && (
                                        <LanguageSelector
                                            defaultLanguage={interview.primary_language || 'en'}
                                            languages={report?.languages}
                                            onChange={setSelectedLanguage}
                                            selectedLanguage={selectedLanguage}
                                        />
                                    )} */}
                    {allQuestions?.length > 0 && (
                        <Button
                            icon="document-download"
                            onClick={() => showModal('questionExport')}
                            theme="secondary"
                        >
                            Export questions
                        </Button>
                    )}

                    <Button
                        url={`/projects/${projectId}/interviews/${interviewId}/questions/update`}
                    >
                        Update questions
                    </Button>
                </div>
            </div>

            <APIView
                empty={strings.questionsList.empty}
                error={error}
                hasError={error}
                isEmpty={allQuestions && !allQuestions?.length}
                isLoading={!error && !allQuestions}
                loadingText="Fetching questions"
            >
                {allQuestions?.length > 0 && (
                    <Table
                        headings={['Title', 'Type', 'Options', 'Updated']}
                        rows={allQuestions.map(question => {
                            return [
                                {
                                    key: 'Title',
                                    content: `${question.data.number}. ${question.data.title}`
                                },
                                {
                                    key: 'Type',
                                    content: (
                                        <div className="space-y-2">
                                            <Badge theme="yellow">
                                                {QUESTION_TYPES[question.data.type]}
                                            </Badge>
                                            {question.data.skip_logic?.length > 0 && <br />}
                                            {question.data.skip_logic?.length > 0 && (
                                                <Badge theme="blue">Has skip logic</Badge>
                                            )}
                                        </div>
                                    )
                                },
                                {
                                    key: 'Options',
                                    content: (
                                        <ul className="ml-3 list-outside list-disc">
                                            {question.data?.options?.map(i => (
                                                <li key={i}>{i}</li>
                                            ))}
                                        </ul>
                                    )
                                },
                                {
                                    key: 'Updated',
                                    content: (
                                        <span className="inline-block min-w-[120px]">
                                            {dayjs(question.data.updated_at).from(new Date())}
                                        </span>
                                    )
                                }
                            ];
                        })}
                    />
                )}
            </APIView>
            {(allQuestions?.length >= itemsPerPage || currentPage > 1) && (
                <>
                    <div className="mt-2" />
                    <Pagination
                        page={currentPage}
                        handleNext={handlePageNext}
                        handlePrevious={handlePagePrevious}
                        showNext={allQuestions?.length >= itemsPerPage}
                    />
                </>
            )}
        </>
    );
};

export default QuestionsList;
