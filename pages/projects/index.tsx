import React from 'react';
import {useRecoilState} from 'recoil';
import useSWR from 'swr';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import APIView from '@/components/APIView';
import DataList from '@/components/DataList';
import ListFilter from '@/components/ListFilter';
import PageHeader from '@/components/PageHeader';
import Pagination from '@/components/Pagination';
import usePagination from '@/components/Pagination/usePagination';
import PageWrapper from '@/components/PageWrapper';
import SEO from '@/components/SEO';
import strings from '@/locales/en.json';
import {COUNTRIES} from '@/utils/countries';
import {projectsListFilterState} from '@/utils/store';
import {getUrlParamsFromObject, pluralise} from '@/utils/helpers';

dayjs.extend(relativeTime);

const ProjectsIndexPage: React.FC = () => {
    const [listFilters, setListFilters] = useRecoilState(projectsListFilterState);
    const {
        currentPage,
        handlePageNext,
        handlePagePrevious,
        itemsOffset,
        itemsPerPage,
        resetPagination
    } = usePagination({itemsPerPage: 20});
    const {
        data: allProjects,
        error,
        mutate
    } = useSWR(
        `/api/projects?${getUrlParamsFromObject(listFilters.filters)}&sort=${
            listFilters.sort
        }&limit=${itemsPerPage}&offset=${itemsOffset}`
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

    const handleListSortChange = newSort => {
        setListFilters({
            ...listFilters,
            sort: newSort
        });
        resetPagination();
    };

    return (
        <PageWrapper>
            <SEO title={strings.projectsList.title} />
            <PageHeader
                primaryCta={{
                    icon: 'plus',
                    label: strings.projectsList.create,
                    url: '/projects/create'
                }}
                title={strings.projectsList.title}
            />

            <div className="mb-4">
                <ListFilter
                    activeFilters={listFilters}
                    filters={strings.projectsList.filters}
                    sorts={strings.projectsList.sort}
                    handleFilterChange={handleListFilterChange}
                    handleSortChange={handleListSortChange}
                />
            </div>

            <APIView
                empty={strings.projectsList.empty}
                error={error}
                hasError={error}
                isEmpty={allProjects && !allProjects?.length}
                isLoading={!error && !allProjects}
                loadingText="Fetching projects"
            >
                {allProjects?.length &&
                    allProjects.map((project, index) => (
                        <DataList
                            key={project.id}
                            id={project.id}
                            actions={[
                                [
                                    {
                                        icon: 'pencil',
                                        label: strings.projectsList.update,
                                        url: `/projects/${project.id}/update`
                                    }
                                ],
                                [
                                    {
                                        icon: 'chevron-right',
                                        label: strings.projectsList.view,
                                        url: `/projects/${project.id}/interviews`
                                    }
                                ]
                            ]}
                            badges={[
                                {
                                    theme: 'orange',
                                    title: `${project.data.interviews_count} ${pluralise(
                                        project.data.interviews_count,
                                        'interview'
                                    )}`
                                }
                            ]}
                            subtitle={`${COUNTRIES[project.data.country]} &middot; Updated ${dayjs(
                                project.data.updated_at
                            ).from(new Date())} by ${project.data.updated_by}`}
                            title={project.data.title}
                        />
                    ))}
            </APIView>
            {(allProjects?.length >= itemsPerPage || currentPage > 1) && (
                <>
                    <div className="mt-2" />
                    <Pagination
                        page={currentPage}
                        handleNext={handlePageNext}
                        handlePrevious={handlePagePrevious}
                        showNext={allProjects?.length >= itemsPerPage}
                    />
                </>
            )}
        </PageWrapper>
    );
};

export default ProjectsIndexPage;
