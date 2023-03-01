import React, {useContext, useEffect, useState} from 'react';
import dynamic from 'next/dynamic';
import {useSession} from 'next-auth/react';
import {useRouter} from 'next/router';
import useSWR from 'swr';
import flatMap from 'lodash/flatMap';
import map from 'lodash/map';
import APIView from '@/components/APIView';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import EmptyPanel from '@/components/EmptyPanel';
import LanguageSelector from '@/components/LanguageSelector';
import {SlideOver, SlideOverContent, SlideOverFooter} from '@/components/Modal/slideOver';
import ModalContext from '@/components/Modal/context';
import ReportDate from '@/components/ReportDate';
import ReportExportModal from '@/components/ReportExportModal';
import ReportResponse from '@/components/ReportResponse';
import ReportResponses from '@/components/ReportResponses';
import ReportQuestionResponseSummary from '@/components/ReportQuestionResponseSummary';
import ReportTopStats from '@/components/ReportTopStats';
import SEO from '@/components/SEO';
import strings from '@/locales/en.json';
import {ModalVisibility} from '@/types/index';
import type {ReportFlaggedOrStarredQuestion} from '@/types/report';
import PredicateRestriction from '@/components/PredicateRestriction';
import InfoBanner from '../InfoBanner';

const ReportTranscriptionAnalysisModal = dynamic(
    () => import('@/components/ReportTranscriptionAnalysisModal')
);

interface Props {
    interview: any;
    interviewId: string;
    projectId: string;
}

export const ReportContext = React.createContext(null);

const InterviewReport: React.FC<Props> = ({interview, interviewId, projectId}: Props) => {
    const router = useRouter();
    const {data: session} = useSession();
    const [selectedLanguage, setSelectedLanguage] = useState<string>(
        interview.primary_language || 'en'
    );
    const {hideModal, modalContext, modalKey, showModal, visibility} = useContext(ModalContext);
    const [filteredResponses, setFilteredResponses] = useState(null);
    const [exportError] = useState<string>(router.query?.error?.toString());

    const {
        data: report,
        error,
        mutate: mutateReport,
        isValidating
    } = useSWR(
        projectId && interviewId
            ? `/api/reports?projectId=${projectId}&interviewId=${interviewId}`
            : null
    );

    const getFilteredResponses = (filterType: 'flagged' | 'ignored' | 'skipped' | 'starred') => {
        if (filterType === 'skipped' || filterType === 'ignored') {
            setFilteredResponses(map(report[`${filterType}Questions`]));
        } else if (filterType === 'starred' || filterType === 'flagged') {
            const flaggedOrStarredResponses = flatMap(report[`${filterType}Questions`]).map(
                (response: ReportFlaggedOrStarredQuestion) => ({
                    answer: response.answer,
                    note: response.question
                })
            );

            setFilteredResponses(flaggedOrStarredResponses);
        }
    };

    useEffect(() => {
        if (modalContext?.filter) {
            getFilteredResponses(modalContext.filter);
        } else {
            setFilteredResponses(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modalContext]);

    useEffect(() => {
        // If there has been an error returned, remove it from the urls otherwise it will
        // persist when the page is refreshed
        if (router.query?.error) {
            router.replace(`/projects/${projectId}/interviews/${interviewId}/report`, undefined, {
                shallow: true
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <SEO title={strings.reportsList.title} />

            <ReportContext.Provider value={{language: selectedLanguage}}>
                {exportError && (
                    <div className="mb-10">
                        <InfoBanner text={exportError} theme="error" />
                    </div>
                )}
                <APIView
                    empty={strings.reportsList.empty}
                    error={error}
                    hasError={error || (report?.error && report?.error !== 'empty')}
                    isEmpty={!report || report.respondents_count === 0}
                    isLoading={isValidating || (!error && !report && interview.status !== 'draft')}
                    loadingText="Fetching report..."
                >
                    {report && !report.error && (
                        <>
                            <div className="mb-4 items-center justify-between md:flex">
                                <div>
                                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                                        {strings.reportsList.stats.title}
                                    </h3>
                                    <ReportDate
                                        endTime={report.end_date}
                                        isReportActive={interview.status === 'active'}
                                        startTime={report.start_date}
                                    />
                                </div>
                                <Button
                                    onClick={() => showModal('reportExport')}
                                    icon="document-download"
                                >
                                    Export report
                                </Button>
                            </div>
                            <ReportTopStats
                                additionalConsentPercent={report.additional_consent_percent}
                                averageDuration={report.average_duration}
                                beneficiaryPercent={report.beneficiaries_percent}
                                flaggedQuestionCount={report.total_flags_count}
                                gendersPercent={report.genders_percent}
                                respondentsCount={report.respondents_count}
                                ignoredQuestionCount={report.total_ignores_count}
                                skippedQuestionCount={report.total_skips_count}
                                starredQuestionCount={report.total_stars_count}
                            />

                            <div className="mt-10 sm:mt-14">
                                <div className="mb-4 flex items-center justify-between space-x-6">
                                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                                        {strings.reportsList.questions}
                                    </h3>
                                    {report?.languages?.length > 1 && (
                                        <LanguageSelector
                                            defaultLanguage={interview.primary_language || 'en'}
                                            languages={report?.languages}
                                            onChange={setSelectedLanguage}
                                            selectedLanguage={selectedLanguage}
                                        />
                                    )}
                                </div>

                                {report.questions?.map((question, index) => {
                                    const flagged = report.flaggedQuestions?.[question.id];
                                    const ignored = report.ignoredQuestions?.[question.id];
                                    const probingQuestions = report.probingQuestions?.[question.id];
                                    const skipped = report.skippedQuestions?.[question.id];
                                    const starred = report.starredQuestions?.[question.id];

                                    return (
                                        <div
                                            className="animate-fade-in-up"
                                            key={question.id}
                                            style={{animationDelay: `${400 + index * 100}ms`}}
                                        >
                                            <ReportQuestionResponseSummary
                                                allOpenResponses={report.openResponses}
                                                allOpenResponsesOrdered={
                                                    report.openResponsesOrdered
                                                }
                                                flagged={flagged}
                                                handleShowResponses={data =>
                                                    showModal('reportResponses', data)
                                                }
                                                ignored={ignored}
                                                probingQuestions={probingQuestions}
                                                question={question}
                                                skipped={skipped}
                                                starred={starred}
                                            />
                                            {index < Object.keys(report.questions).length - 1 && (
                                                <div className="mb-4 sm:mb-6" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                    {report && report.error === 'empty' && (
                        <EmptyPanel>{strings.reportsList.empty}</EmptyPanel>
                    )}
                </APIView>
                {report && report.enumerator_notes && (
                    <>
                        <h3 className="mb-4 mt-10 flex items-center space-x-2 text-lg font-medium leading-6 text-gray-900 sm:mt-14">
                            <span>{strings.reportsList.enumeratorNotes._title}</span>
                            <Badge theme="pink">
                                {Object.keys(report.enumerator_notes).length}
                            </Badge>
                        </h3>
                        <Button onClick={() => showModal('reportEnumeratorNotes')}>
                            {strings.reportsList.enumeratorNotes.cta}
                        </Button>
                    </>
                )}
                {report && !report.error && (
                    <PredicateRestriction predicate="isInternal" data={session.user.email}>
                        <h3 className="mb-4 mt-10 text-lg font-medium leading-6 text-gray-900 sm:mt-14">
                            {strings.reportsList.transcriptionAnalysis}
                        </h3>
                        <Button onClick={() => showModal('reportTranscription')}>
                            {strings.reportsList.transcription.cta}
                        </Button>
                        <ReportTranscriptionAnalysisModal
                            openResponses={report.openResponses}
                            probingQuestions={report.probingQuestions}
                        />
                    </PredicateRestriction>
                )}
                <SlideOver
                    handleClose={hideModal}
                    visibility={
                        [
                            'reportFilteredResponses',
                            'reportResponses',
                            'reportEnumeratorNotes'
                        ].includes(modalKey)
                            ? visibility
                            : ModalVisibility.HIDDEN
                    }
                >
                    {modalKey === 'reportFilteredResponses' && modalContext && (
                        <SlideOverContent
                            handleClose={hideModal}
                            subtitle={modalContext?.subtitle}
                            title={modalContext?.title}
                        >
                            {modalContext?.filter &&
                                filteredResponses?.length &&
                                filteredResponses.map((response, index) => (
                                    <ReportResponse
                                        answer={response}
                                        key={index}
                                        interviewId={interviewId?.toString()}
                                        projectId={projectId?.toString()}
                                        report={report}
                                        type="open response"
                                    />
                                ))}
                        </SlideOverContent>
                    )}
                    {modalKey === 'reportResponses' && modalContext && (
                        <SlideOverContent
                            handleClose={hideModal}
                            subtitle={modalContext?.question?.number}
                            title={modalContext?.question?.title[selectedLanguage]}
                        >
                            <ReportResponses
                                allResponses={modalContext.responses}
                                answer={modalContext.responses}
                                interviewId={interviewId?.toString()}
                                mutateReport={mutateReport}
                                projectId={projectId?.toString()}
                                report={report}
                                responsesOrdered={modalContext?.responsesOrdered}
                                question={modalContext.question}
                                type="open response"
                            />
                        </SlideOverContent>
                    )}
                    {modalKey === 'reportEnumeratorNotes' && (
                        <SlideOverContent
                            handleClose={hideModal}
                            title={strings.reportsList.enumeratorNotes.title}
                        >
                            {Object.keys(report.enumerator_notes).map(responseId => {
                                const note = report.enumerator_notes[responseId];

                                return (
                                    <ReportResponse
                                        key={note.text}
                                        enumeratorNote={note}
                                        interviewId={interviewId?.toString()}
                                        mutateReport={mutateReport}
                                        projectId={projectId?.toString()}
                                        report={report}
                                        responseId={responseId}
                                        type="note"
                                    />
                                );
                            })}
                        </SlideOverContent>
                    )}
                    <SlideOverFooter handleClose={hideModal} />
                </SlideOver>
                {interview && (
                    <ReportExportModal
                        defaultLanguage={interview.primary_language || 'en'}
                        interviewIds={[interviewId?.toString()]}
                        languages={report?.languages}
                        projectId={projectId?.toString()}
                        title={`${interview.project.title} - ${interview.title} export`}
                    />
                )}
            </ReportContext.Provider>
        </>
    );
};

export default InterviewReport;
