import React, {useContext} from 'react';
import ReactDiffViewer from 'react-diff-viewer';
import ModalContext from '@/components/Modal/context';
import {SlideOver, SlideOverContent} from '@/components/Modal/slideOver';
import strings from '@/locales/en.json';
import {ModalVisibility} from '@/types/index';
import {ReportOpenResponse, ReportProbingQuestion} from '@/types/report';
import {getAverage, getSimilarity} from '@/utils/helpers';

interface Props {
    openResponses: ReportOpenResponse;
    probingQuestions: ReportProbingQuestion;
}

const sortResponsesByQuestion = (...responses) => {
    const combinedResponses = [];

    responses
        .filter(response => response)
        .map(response => {
            Object.keys(response).map(responseId => {
                Object.keys(response[responseId]).map(questionId => {
                    combinedResponses.push(response[responseId][questionId]);
                });
            });
        });

    return combinedResponses;
};

const ReportTranscriptionAnalysisModal: React.FC<Props> = ({
    openResponses,
    probingQuestions
}: Props) => {
    const {hideModal, modalKey, visibility} = useContext(ModalContext);
    const allResponses = sortResponsesByQuestion(openResponses, probingQuestions);
    const filteredResponses = allResponses
        .filter(response => !response.skipped && response.answer && response.used_transcription)
        .map(response => ({
            ...response,
            similarity: getSimilarity(response.answer, response.transcribed_answer)
        }));
    const averageSimilarity = getAverage(filteredResponses.map(r => parseInt(r.similarity)));

    return (
        <SlideOver
            handleClose={hideModal}
            visibility={modalKey === 'reportTranscription' ? visibility : ModalVisibility.HIDDEN}
        >
            <SlideOverContent
                handleClose={hideModal}
                subtitle={strings.reportsList.transcription.subtitle}
                title={strings.reportsList.transcription.title}
            >
                <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-12">
                    <div className="animate-fade-in-up col-span-6 animation-delay-100 sm:flex">
                        <div className="flex w-full items-center overflow-hidden rounded-lg bg-white shadow">
                            <div className="px-4 py-5 sm:p-6">
                                <dl>
                                    <dt className="truncate text-sm font-medium leading-5 text-gray-500">
                                        {strings.reportsList.transcription.total}
                                    </dt>
                                    <dd className="mt-1 text-3xl font-semibold leading-9 text-gray-900">
                                        {filteredResponses.length}{' '}
                                        <span className="text-xl font-medium text-gray-500">
                                            / {allResponses.length}{' '}
                                            <small>
                                                {strings.reportsList.transcription.totalLabel}
                                            </small>
                                        </span>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="animate-fade-in-up col-span-3 animation-delay-100 sm:flex">
                        <div className="flex w-full items-center overflow-hidden rounded-lg bg-white shadow">
                            <div className="px-4 py-5 sm:p-6">
                                <dl>
                                    <dt className="truncate text-sm font-medium leading-5 text-gray-500">
                                        {strings.reportsList.transcription.average}
                                    </dt>
                                    <dd className="mt-1 text-3xl font-semibold leading-9 text-gray-900">
                                        {Math.ceil(averageSimilarity)}
                                        <span className="text-xl font-medium text-gray-500">%</span>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                {filteredResponses.map((response, index) => (
                    <div
                        key={index}
                        className="mb-3 overflow-hidden bg-white shadow transition-all duration-200 hover:shadow-md sm:rounded-lg"
                    >
                        <div className="diff-container border-b border-gray-200 px-4 py-4 sm:px-6">
                            <ReactDiffViewer
                                hideLineNumbers={true}
                                oldValue={response.transcribed_answer}
                                newValue={response.answer}
                                showDiffOnly={false}
                                splitView={false}
                            />
                        </div>
                        <footer className="flex items-center justify-between bg-gray-50 px-4 py-3 sm:px-6">
                            <div className="flex-grow text-sm font-medium text-gray-400">
                                {Math.ceil(response.similarity)}% similar
                            </div>
                        </footer>
                    </div>
                ))}
            </SlideOverContent>
        </SlideOver>
    );
};

export default ReportTranscriptionAnalysisModal;
