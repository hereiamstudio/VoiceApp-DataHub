import React, {useContext} from 'react';
import {useRecoilState} from 'recoil';
import {useRouter} from 'next/router';
import useSWR from 'swr';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import APIView from '@/components/APIView';
import Button from '@/components/Button';
import DataList from '@/components/DataList';
import ListFilter from '@/components/ListFilter';
import ModalContext from '@/components/Modal/context';
import PageHeader from '@/components/PageHeader';
import Pagination from '@/components/Pagination';
import usePagination from '@/components/Pagination/usePagination';
import PageWrapper from '@/components/PageWrapper';
import ReportExportModal from '@/components/ReportExportModal';
import SEO from '@/components/SEO';
import strings from '@/locales/en.json';
import {interviewsListFilterState} from '@/utils/store';
import {INTERVIEW_LANGUAGES, INTERVIEW_STATUSES_THEMES} from '@/utils/interviews';
import {getUrlParamsFromObject, pluralise} from '@/utils/helpers';

dayjs.extend(relativeTime);

const InterviewsListPage: React.FC = () => {
    const router = useRouter();
    const {projectId} = router.query;
    const {showModal} = useContext(ModalContext);
    const [listFilters, setListFilters] = useRecoilState(interviewsListFilterState);
    const {
        currentPage,
        handlePageNext,
        handlePagePrevious,
        itemsOffset,
        itemsPerPage,
        resetPagination
    } = usePagination({itemsPerPage: 20});
    const {data: project} = useSWR(projectId ? `/api/projects/${projectId}?minimal=true` : null);
    const {
        data: allInterviews,
        error,
        mutate
    } = useSWR(
        projectId
            ? `/api/interviews?projectId=${projectId}&${getUrlParamsFromObject(
                  listFilters.filters
              )}&limit=${itemsPerPage}&offset=${itemsOffset}`
            : null
    );

    const handleListFilterChange = newFilters => {
        setListFilters({
            ...listFilters,
            filters: newFilters
        });
        resetPagination();
        // mutate(
        //     `/api/projects?${getUrlParamsFromObject(newFilters)}&limit=${itemsPerPage}&offset=0`
        // );
    };

    return (
        <PageWrapper>
            <SEO title={strings.interviewsList.title} />
            <PageHeader
                breadcrumbNav={[
                    {label: 'All projects', url: '/projects'},
                    {
                        label: project?.title || '-',
                        url: `/projects/${projectId}/update`
                    },
                    {label: 'Interviews'}
                ]}
                secondaryCta={{
                    icon: 'chevron-left',
                    iconPosition: 'left',
                    label: strings.interviewsList.back,
                    url: '/projects'
                }}
                CustomPrimaryCta={
                    allInterviews?.length
                        ? () => (
                              <Button
                                  icon="document-download"
                                  onClick={() => showModal('reportExport')}
                              >
                                  Export report
                              </Button>
                          )
                        : null
                }
                primaryCta={{
                    icon: 'plus',
                    label: strings.interviewsList.create,
                    url: `/projects/${projectId}/interviews/create`
                }}
                title={strings.interviewsList.title}
            />
            <div className="mb-4">
                <ListFilter
                    activeFilters={listFilters}
                    filters={strings.interviewsList.filters}
                    handleFilterChange={handleListFilterChange}
                />
            </div>
            {project && allInterviews?.length > 0 && (
                <ReportExportModal
                    defaultLanguage="en"
                    languages={['en']}
                    interviewIds={allInterviews.map(interview => interview.id)}
                    projectId={projectId?.toString()}
                    title={`${project.title} - All interviews export`}
                    type="project"
                />
            )}

            <APIView
                empty={strings.interviewsList.empty}
                error={error}
                hasError={error}
                isEmpty={allInterviews && !allInterviews?.length}
                isLoading={!error && !allInterviews}
                loadingText="Fetching interviews"
            >
                {allInterviews?.length &&
                    allInterviews.map((interview, index) => (
                        <DataList
                            key={interview.id}
                            actions={[
                                {
                                    icon: 'chevron-right',
                                    label: strings.interviewsList.view,
                                    url: `/projects/${projectId}/interviews/${interview.id}/overview`
                                },
                                {
                                    icon: 'lock',
                                    label: strings.interviewsList.updateStatus,
                                    url: `/projects/${projectId}/interviews/${interview.id}/details`
                                },
                                {
                                    icon: 'users',
                                    label: strings.interviewsList.updateUsers,
                                    url: `/projects/${projectId}/interviews/${interview.id}/users`
                                },
                                {
                                    icon: 'id',
                                    label: strings.interviewsList.updateConsent,
                                    url: `/projects/${projectId}/interviews/${interview.id}/consent`
                                },
                                {
                                    icon: 'chat',
                                    label: strings.interviewsList.updateQuestions,
                                    url: `/projects/${projectId}/interviews/${interview.id}/questions`
                                },
                                {
                                    icon: 'chart',
                                    label: strings.interviewsList.viewResponses,
                                    url: `/projects/${projectId}/interviews/${interview.id}/report`
                                }
                            ]}
                            badges={[
                                {
                                    theme: INTERVIEW_STATUSES_THEMES[interview.data.status],
                                    title: strings.interviewsList[interview.data.status]
                                },
                                {
                                    theme: 'yellow',
                                    title: `${interview.data.users_count} ${pluralise(
                                        interview.data.users_count,
                                        'assignee'
                                    )}`
                                },
                                interview.data.responses_count > 0
                                    ? {
                                          theme: 'orange',
                                          title: `${interview.data.responses_count} ${pluralise(
                                              interview.data.responses_count,
                                              'response'
                                          )}`
                                      }
                                    : null
                            ]}
                            subtitle={`${
                                INTERVIEW_LANGUAGES[interview.data.primary_language]
                            } &middot; Updated ${dayjs(interview.data.updated_at).from(
                                new Date()
                            )} by ${interview.data.updated_by}`}
                            title={interview.data.title}
                        />
                    ))}
            </APIView>
            {(allInterviews?.length >= itemsPerPage || currentPage > 1) && (
                <>
                    <div className="mt-2" />
                    <Pagination
                        page={currentPage}
                        handleNext={handlePageNext}
                        handlePrevious={handlePagePrevious}
                        showNext={allInterviews?.length >= itemsPerPage}
                    />
                </>
            )}
        </PageWrapper>
    );
};

export default InterviewsListPage;
