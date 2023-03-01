import React, {useState, memo} from 'react';
import set from 'lodash/set';
import Badge from '@/components/Badge';
import Divider from '@/components/Divider';
import ReportResponseProof from '@/components/ReportResponseProof';
import strings from '@/locales/en.json';
import type {EnumeratorNote, ResponseAnswer, ResponseQuestion} from '@/types/response';
import getCopyValue from '@/utils/copy';

interface Props {
    answer?: ResponseAnswer;
    enumeratorNote?: EnumeratorNote;
    interviewId: string;
    mutateReport?: Function;
    projectId: string;
    report: Object;
    question?: ResponseQuestion;
    responseId?: string;
    type: 'note' | 'open response';
}

const ReportResponse: React.FC<Props> = ({
    answer,
    enumeratorNote,
    interviewId,
    mutateReport,
    projectId,
    report,
    responseId,
    question,
    type = 'open response'
}: Props) => {
    const [cachedAnswer, setCachedAnswer] = useState(answer);
    const [isDetailView, setIsDetailView] = useState(false);
    const isProofed = cachedAnswer?.is_proofed || enumeratorNote?.is_proofed;

    const handleProofingToggle = () => setIsDetailView(!isDetailView);

    const handleResponseProofed = proofedAnswer => {
        /**
         * TODO: Maybe Recoil will be a nicer way of handling this?
         * We don't want to do a full reload just for a field change...
         */
        if (type === 'open response') {
            const updatedAnswer = {
                ...cachedAnswer,
                ...proofedAnswer,
                answer: proofedAnswer.proofed,
                original_answer: proofedAnswer.original
            };

            setCachedAnswer(updatedAnswer);
            mutateReport(set(report, `openResponses.${question.id}.${responseId}`, updatedAnswer));
        } else if (type === 'note') {
            const updatedAnswer = {
                ...cachedAnswer,
                ...proofedAnswer,
                text: proofedAnswer.proofed,
                original_text: proofedAnswer.original
            };

            setCachedAnswer(updatedAnswer);
            mutateReport(set(report, `enumerator_notes.${responseId}`, updatedAnswer));
        }

        setIsDetailView(false);
    };

    return (
        <div className="mb-3 overflow-hidden bg-white shadow transition-all duration-200 hover:shadow-md sm:rounded-lg">
            <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
                <div
                    className={`mb-2 text-sm font-medium tracking-wide text-gray-500 transition-all duration-300 ease-in-out ${
                        isDetailView ? 'opacity-1 h-5 translate-y-0' : 'h-0 translate-y-4 opacity-0'
                    }`}
                >
                    {getCopyValue(
                        isProofed ? 'reportsList.proof.proofed' : 'reportsList.proof.original',
                        {type}
                    )}
                </div>
                {type === 'open response'
                    ? cachedAnswer?.answers
                        ? cachedAnswer.answers
                        : cachedAnswer.answer
                    : enumeratorNote.text}
                {isDetailView && (
                    <div className="animate-fade-in">
                        <Divider paddingVertical="sm" />

                        <div
                            className={`mb-4 text-sm font-medium tracking-wide text-gray-500 transition-all duration-300 ease-in-out ${
                                isDetailView
                                    ? 'opacity-1 h-5 translate-y-0'
                                    : 'h-0 translate-y-4 opacity-0'
                            }`}
                        >
                            {getCopyValue(
                                isProofed ? 'reportsList.proof.original' : 'reportsList.proof.add',
                                {type}
                            )}
                        </div>

                        {isProofed && (
                            <p>
                                {type === 'open response'
                                    ? cachedAnswer?.original_answers
                                        ? cachedAnswer.original_answers
                                        : cachedAnswer.original_answer
                                    : enumeratorNote.original_text}
                            </p>
                        )}
                        {!isProofed && type === 'open response' && (
                            <ReportResponseProof
                                endpoint={`/api/reports/proof-open-response?projectId=${projectId}&interviewId=${interviewId}&responseId=${responseId}&questionId=${question.id}`}
                                handleSuccess={handleResponseProofed}
                                original={cachedAnswer.answer}
                                type={type}
                            />
                        )}
                        {!isProofed && type === 'note' && (
                            <ReportResponseProof
                                endpoint={`/api/reports/proof-enumerator-note?projectId=${projectId}&interviewId=${interviewId}&responseId=${responseId}`}
                                handleSuccess={handleResponseProofed}
                                original={enumeratorNote.text}
                                type={type}
                            />
                        )}
                    </div>
                )}
            </div>
            <footer className="flex items-center justify-between bg-gray-50 px-4 py-3 sm:px-6">
                <div
                    className="flex flex-grow animate-fade-in items-center space-x-2"
                    key={[
                        cachedAnswer ? 1 : 0,
                        cachedAnswer?.total,
                        cachedAnswer?.used_transcription,
                        cachedAnswer?.is_translated,
                        cachedAnswer?.is_flagged,
                        cachedAnswer?.is_skipped,
                        cachedAnswer?.is_starred,
                        cachedAnswer?.is_probing_question,
                        isProofed
                    ].join('')}
                >
                    {cachedAnswer && (
                        <>
                            {cachedAnswer.total && (
                                <Badge theme="white">{cachedAnswer.total} times</Badge>
                            )}
                            {cachedAnswer.used_transcription && (
                                <Badge icon="audio" theme="pink">
                                    {strings.reportsList.proof.usedTranscription}
                                </Badge>
                            )}
                            {cachedAnswer.is_translated && (
                                <Badge icon="translate" theme="blue">
                                    {strings.reportsList.proof.isTranslated}
                                </Badge>
                            )}
                            {cachedAnswer.is_flagged && (
                                <Badge icon="flag" theme="red">
                                    {strings.reportsList.proof.isFlagged}
                                </Badge>
                            )}
                            {cachedAnswer.is_skipped && (
                                <Badge icon="skip" theme="yellow">
                                    {strings.reportsList.proof.isSkipped}
                                </Badge>
                            )}
                            {cachedAnswer.is_starred && (
                                <Badge icon="star" theme="orange">
                                    {strings.reportsList.proof.isStarred}
                                </Badge>
                            )}
                        </>
                    )}
                    {isProofed && !cachedAnswer?.is_translated && (
                        <Badge icon="check" theme="green">
                            {isDetailView && cachedAnswer?.proofed_by?.first_name
                                ? `${strings.reportsList.proof.proofedBy} ${cachedAnswer.proofed_by.first_name} ${cachedAnswer.proofed_by.last_name}`
                                : strings.reportsList.proof.isProofed}
                        </Badge>
                    )}
                </div>

                {mutateReport && (
                    <button
                        className="text-sm text-pink-500 underline focus:outline-none"
                        onClick={handleProofingToggle}
                    >
                        {isDetailView
                            ? strings.reportsList.proof.cancel
                            : getCopyValue(
                                  isProofed
                                      ? 'reportsList.proof.ctaProofed'
                                      : 'reportsList.proof.cta',
                                  {type}
                              )}
                    </button>
                )}
            </footer>
        </div>
    );
};

export default memo(ReportResponse);
