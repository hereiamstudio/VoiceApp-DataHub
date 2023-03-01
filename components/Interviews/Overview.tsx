import React from 'react';
import {useRouter} from 'next/router';
import useSWR from 'swr';
import ActivityIndicator from '@/components/ActivityIndicator';
import ArchiveDocument from '@/components/ArchiveDocument';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import RoleRestriction from '@/components/RoleRestriction';
import SEO from '@/components/SEO';
import strings from '@/locales/en.json';
import {pluralise} from '@/utils/helpers';
import {INTERVIEW_STATUSES_THEMES} from '@/utils/interviews';

interface Props {
    interview: any;
    isLocked?: boolean;
    interviewId: string;
    mutateInterview: Function;
    projectId: string;
}

const StatusIcon = ({isComplete, isPending}: {isComplete?: boolean; isPending?: boolean}) => {
    if (isComplete) {
        return (
            <div className="mt-0.5 text-green-500">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                    />
                </svg>
            </div>
        );
    } else if (isPending) {
        return (
            <div className="mt-0.5 text-yellow-300">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
            </div>
        );
    } else {
        return (
            <div className="mt-0.5 text-red-500">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
            </div>
        );
    }
};

const InterviewOverview: React.FC<Props> = ({
    interview,
    interviewId,
    isLocked,
    mutateInterview,
    projectId
}: Props) => {
    const router = useRouter();
    const {data: overview} = useSWR(
        projectId && interviewId
            ? `/api/interviews/${interviewId}/overview?projectId=${projectId}`
            : null
    );
    const isUsersStepComplete = overview?.userSize > 1;
    const isConsentStepComplete = overview?.consentSize > 0;
    const isQuestionsStepComplete = overview?.questionSize > 0;
    const canInterviewBePublished =
        isUsersStepComplete && isConsentStepComplete && isQuestionsStepComplete;

    const handleArchiveUpdate = async is_archived => {
        await mutateInterview({
            ...interview,
            ...{is_archived}
        });
    };

    return (
        <>
            <SEO title={strings.interviewsUpdate.title} />

            {interview && overview ? (
                <div className="animate-fade-in">
                    <ul className="space-y-4 divide-y divide-gray-200">
                        <li className="flex items-start space-x-3">
                            <StatusIcon isComplete={interview.status !== 'draft'} />
                            <div className="flex flex-grow flex-col">
                                <div className="mb-2 flex items-center space-x-2">
                                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                                        Status
                                    </h3>
                                    <Badge theme={INTERVIEW_STATUSES_THEMES[interview?.status]}>
                                        {strings.interviewsList[interview?.status]}
                                    </Badge>
                                </div>
                                {interview?.status === 'draft' && (
                                    <p className="text-sm leading-5 text-gray-500">
                                        {canInterviewBePublished
                                            ? 'The interview can now be updated to active.'
                                            : 'You need to complete the consent, users, and questions step before you can publish the interview.'}
                                    </p>
                                )}
                            </div>
                            <div>
                                {!isLocked && (
                                    <Button
                                        url={`/projects/${projectId}/interviews/${interviewId}/details`}
                                    >
                                        Update status
                                    </Button>
                                )}
                            </div>
                        </li>
                        <li className="flex items-start space-x-3 pt-4">
                            <StatusIcon isComplete={isUsersStepComplete} />
                            <div className="flex-grow space-y-4 md:flex md:justify-between md:space-y-0 md:space-x-6">
                                <div className="flex-grow">
                                    <h3 className="mb-1 text-lg font-medium leading-6 text-gray-900">
                                        Users
                                    </h3>
                                    {isUsersStepComplete ? (
                                        <p className="text-sm leading-5 text-gray-500">
                                            There {overview.userSize === 1 ? 'is' : 'are'}{' '}
                                            {overview.userSize}{' '}
                                            {pluralise(overview.userSize, 'user')} assigned to this
                                            interview.
                                        </p>
                                    ) : (
                                        <p className="text-sm leading-5 text-gray-500">
                                            You must assign users to the interview before it can be
                                            made active.
                                        </p>
                                    )}
                                </div>
                                <div>
                                    {!isLocked && (
                                        <Button
                                            theme={isUsersStepComplete ? 'secondary' : 'primary'}
                                            url={`/projects/${projectId}/interviews/${interviewId}/users`}
                                        >
                                            {isUsersStepComplete ? 'Update' : 'Add'} users
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </li>
                        <li className="flex items-start space-x-3 pt-4">
                            <StatusIcon isComplete={isConsentStepComplete} />
                            <div className="flex-grow space-y-4 md:flex md:justify-between md:space-y-0 md:space-x-6">
                                <div className="flex-grow">
                                    <h3 className="mb-1 text-lg font-medium leading-6 text-gray-900">
                                        Consent
                                    </h3>
                                    {isConsentStepComplete ? (
                                        <p className="text-sm leading-5 text-gray-500">
                                            There {overview.consentSize === 1 ? 'is' : 'are'}{' '}
                                            {overview.consentSize} consent{' '}
                                            {pluralise(overview.consentSize, 'step')}.
                                        </p>
                                    ) : (
                                        <p className="text-sm leading-5 text-gray-500">
                                            You must add at least 1 consent script to the interview
                                            before it can be made active.
                                        </p>
                                    )}
                                </div>
                                <div>
                                    {!isLocked && (
                                        <Button
                                            theme={isConsentStepComplete ? 'secondary' : 'primary'}
                                            url={`/projects/${projectId}/interviews/${interviewId}/consent`}
                                        >
                                            {isConsentStepComplete ? 'Update' : 'Add'} consent
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </li>
                        <li className="flex items-start space-x-3 pt-4">
                            <StatusIcon isComplete={isQuestionsStepComplete} />
                            <div className="flex-grow space-y-4 md:flex md:justify-between md:space-y-0 md:space-x-6">
                                <div className="flex-grow">
                                    <h3 className="mb-1 text-lg font-medium leading-6 text-gray-900">
                                        Questions
                                    </h3>
                                    {isQuestionsStepComplete ? (
                                        <p className="text-sm leading-5 text-gray-500">
                                            There {overview.questionSize === 1 ? 'is' : 'are'}{' '}
                                            {overview.questionSize}{' '}
                                            {pluralise(overview.questionSize, 'question')}.
                                        </p>
                                    ) : (
                                        <p className="text-sm leading-5 text-gray-500">
                                            You must add at least 1 question to the interview before
                                            it can be made active.
                                        </p>
                                    )}
                                </div>
                                <div>
                                    {!isLocked && (
                                        <Button
                                            theme={
                                                isQuestionsStepComplete ? 'secondary' : 'primary'
                                            }
                                            url={`/projects/${projectId}/interviews/${interviewId}/questions`}
                                        >
                                            {isQuestionsStepComplete ? 'Update' : 'Add'} questions
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </li>
                        <li className="flex items-start space-x-3 pt-4">
                            <StatusIcon
                                isComplete={overview.responseSize > 0}
                                isPending={interview.status === 'active'}
                            />
                            <div className="flex-grow space-y-4 md:flex md:justify-between md:space-y-0 md:space-x-6">
                                <div className="flex-grow">
                                    <h3 className="mb-1 text-lg font-medium leading-6 text-gray-900">
                                        Report
                                    </h3>
                                    {interview.status === 'complete' ||
                                    overview.responseSize > 0 ? (
                                        <p className="text-sm leading-5 text-gray-500">
                                            There {overview.responseSize === 1 ? 'is' : 'are'}{' '}
                                            {overview.responseSize}{' '}
                                            {pluralise(overview.responseSize, 'response')}
                                            {interview.status === 'active' ? ' so far' : ''}.
                                        </p>
                                    ) : (
                                        <p className="text-sm leading-5 text-gray-500">
                                            There are no responses to this interview yet. Please
                                            check back soon.
                                        </p>
                                    )}
                                </div>
                                <div>
                                    {overview.responseSize > 0 ? (
                                        <Button
                                            theme="secondary"
                                            url={`/projects/${projectId}/interviews/${interviewId}/report`}
                                        >
                                            View report
                                        </Button>
                                    ) : null}
                                </div>
                            </div>
                        </li>
                    </ul>
                    <RoleRestriction action="interviews:archive">
                        <div className="mt-20">
                            <ArchiveDocument
                                collection="interviews"
                                handleUpdate={handleArchiveUpdate}
                                id={interviewId?.toString()}
                                isArchived={interview?.is_archived}
                                queryParams={`projectId=${projectId}`}
                            />
                        </div>
                    </RoleRestriction>
                </div>
            ) : (
                <div className="h-30 flex items-center justify-center">
                    <ActivityIndicator />
                    <span className="ml-2 text-sm text-gray-500">Fetching interview overview</span>
                </div>
            )}
        </>
    );
};

export default InterviewOverview;
