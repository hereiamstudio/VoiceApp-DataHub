import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import useSWR from 'swr';
import InfoBanner from '@/components/InfoBanner';
import InterviewConsent from '@/components/Interviews/Consent';
import InterviewDetails from '@/components/Interviews/Details';
import InterviewOverview from '@/components/Interviews/Overview';
import InterviewQuestionsList from '@/components/Interviews/QuestionsList';
import InterviewReport from '@/components/Interviews/Report';
import InterviewTabBar from '@/components/Interviews/TabBar';
import InterviewUsers from '@/components/Interviews/Users';
import PageHeader from '@/components/PageHeader';
import PageWrapper from '@/components/PageWrapper';
import strings from '@/locales/en.json';

const InterviewPage: React.FC = () => {
    const router = useRouter();
    const {projectId, interviewId} = router.query;
    const [activeTab, setActiveTab] = useState(router.query?.tab?.toString() || 'interview');
    const {
        data: interview,
        error,
        mutate: mutateInterview
    } = useSWR(() =>
        projectId && interviewId ? `/api/interviews/${interviewId}?projectId=${projectId}` : null
    );
    const isLocked = interview?.data?.status === 'complete';

    useEffect(() => {
        if (router.query?.page) {
            setActiveTab(router.query.page.toString());
        }
    }, [router.query]);

    return (
        <PageWrapper language={interview?.data?.primary_language}>
            <PageHeader
                breadcrumbNav={[
                    {label: 'All projects', url: '/projects'},
                    {
                        label: interview?.data?.project?.title || '-',
                        url: `/projects/${projectId}/update`
                    },
                    {
                        label: 'Interviews',
                        url: `/projects/${projectId}/interviews`
                    },
                    {
                        label: interview?.data?.title || '-',
                        url: `/projects/${projectId}/interviews/${interviewId}/update`
                    }
                ]}
                language={interview?.data?.primary_language}
                secondaryCta={{
                    label: 'Back',
                    icon: 'chevron-left',
                    iconPosition: 'left',
                    url: `/projects/${projectId}/interviews`
                }}
                title={interview?.data?.title}
            />

            <InterviewTabBar
                activeTab={activeTab}
                interviewId={interviewId?.toString()}
                interviewStatus={interview?.data?.status}
                projectId={projectId?.toString()}
            />

            {interview?.data?.primary_language === 'ar' &&
                !['report', 'overview'].includes(activeTab) && (
                    <div className="-mb-4">
                        <InfoBanner text={strings.generic.primaryLanguageWarning} />
                    </div>
                )}

            {interview && (
                <div className="mt-8 animate-fade-in" key={activeTab}>
                    {activeTab === 'consent' && (
                        <InterviewConsent
                            interview={interview?.data || interview}
                            interviewId={interviewId.toString()}
                            isLocked={isLocked}
                            mutateInterview={mutateInterview}
                            projectId={projectId.toString()}
                        />
                    )}
                    {activeTab === 'details' && (
                        <InterviewDetails
                            interview={interview?.data}
                            interviewId={interviewId.toString()}
                            isLocked={isLocked}
                            mutateInterview={mutateInterview}
                            projectId={projectId.toString()}
                        />
                    )}
                    {activeTab === 'overview' && (
                        <InterviewOverview
                            interview={interview?.data}
                            interviewId={interviewId.toString()}
                            isLocked={isLocked}
                            mutateInterview={mutateInterview}
                            projectId={projectId.toString()}
                        />
                    )}
                    {activeTab === 'questions' && (
                        <InterviewQuestionsList
                            interview={interview?.data}
                            interviewId={interviewId.toString()}
                            isLocked={isLocked || interview?.data?.status === 'active'}
                            project={interview?.data?.project}
                            projectId={projectId.toString()}
                        />
                    )}
                    {activeTab === 'report' && (
                        <InterviewReport
                            interview={interview?.data}
                            interviewId={interviewId.toString()}
                            projectId={projectId.toString()}
                        />
                    )}
                    {activeTab === 'users' && (
                        <InterviewUsers
                            interview={interview?.data}
                            interviewId={interviewId.toString()}
                            isLocked={isLocked}
                            mutateInterview={mutateInterview}
                            projectId={projectId.toString()}
                        />
                    )}
                </div>
            )}
        </PageWrapper>
    );
};

export default InterviewPage;
