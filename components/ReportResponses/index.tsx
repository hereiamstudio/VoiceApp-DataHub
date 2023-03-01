import React from 'react';
import useSWR from 'swr';
import APIView from '@/components/APIView';
import Pagination from '@/components/Pagination';
import usePagination from '@/components/Pagination/usePagination';
import ReportResponse from '@/components/ReportResponse';
import type {EnumeratorNote, ResponseAnswer, ResponseQuestion} from '@/types/response';

interface Props {
    allResponses: any[];
    answer?: ResponseAnswer;
    enumeratorNote?: EnumeratorNote;
    filter?: string;
    interviewId: string;
    mutateReport?: Function;
    projectId: string;
    report: Object;
    responsesOrdered: any[];
    question?: ResponseQuestion;
    responseId?: string;
    type: 'note' | 'open response';
}

const ReportResponses: React.FC<Props> = ({
    allResponses,
    answer,
    enumeratorNote,
    filter = '',
    interviewId,
    mutateReport,
    projectId,
    report,
    responsesOrdered,
    question,
    responseId,
    type
}: Props) => {
    const {
        currentPage,
        handlePageNext,
        handlePagePrevious,
        itemsOffset,
        itemsPerPage,
        resetPagination
    } = usePagination({itemsPerPage: 100});

    const {
        data: fetchedResponses,
        error,
        isValidating
    } = useSWR(
        !allResponses || !Object.keys(allResponses)?.length
            ? `/api/reports/open-responses?filter=${filter}&questionId=${question?.id}&interviewId=${interviewId}&projectId=${projectId}&limit=${itemsPerPage}&offset=${itemsOffset}`
            : null
    );

    if (allResponses && Object.keys(allResponses)?.length && responsesOrdered) {
        return (
            <>
                {responsesOrdered.map((responseId, index) => (
                    <ReportResponse
                        answer={allResponses[responseId]}
                        key={responseId}
                        interviewId={interviewId?.toString()}
                        mutateReport={mutateReport}
                        projectId={projectId?.toString()}
                        report={report}
                        responseId={responseId}
                        question={question}
                        type={type}
                    />
                ))}
            </>
        );
    } else {
        return (
            <>
                <APIView
                    empty={`No ${filter} responses were found for this question.`}
                    error={error}
                    hasError={error}
                    isEmpty={!fetchedResponses || !fetchedResponses?.length}
                    isLoading={!error && !fetchedResponses}
                    loadingText="Fetching responses"
                >
                    {fetchedResponses && (
                        <div className="relative">
                            {fetchedResponses.map((response, index) => (
                                <ReportResponse
                                    answer={response}
                                    key={response.id}
                                    interviewId={interviewId}
                                    mutateReport={mutateReport}
                                    projectId={projectId}
                                    report={report}
                                    responseId={response.response_id}
                                    question={question}
                                    type={type}
                                />
                            ))}
                        </div>
                    )}
                </APIView>
                {(fetchedResponses?.length >= 100 || currentPage > 1) && (
                    <div className="sticky bottom-0 -mx-6 bg-gray-100 px-6" style={{bottom: -24}}>
                        <Pagination
                            page={currentPage}
                            handleNext={handlePageNext}
                            handlePrevious={handlePagePrevious}
                            showNext={fetchedResponses?.length >= itemsPerPage}
                        />
                    </div>
                )}
            </>
        );
    }
};

export default ReportResponses;
