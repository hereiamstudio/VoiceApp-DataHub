import React from 'react';
import {useRecoilState} from 'recoil';
import useSWR from 'swr';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import APIView from '@/components/APIView';
import DataList from '@/components/DataList';
import Dropdown from '@/components/Dropdown';
import ListFilter from '@/components/ListFilter';
import PageHeader from '@/components/PageHeader';
import Pagination from '@/components/Pagination';
import usePagination from '@/components/Pagination/usePagination';
import PageWrapper from '@/components/PageWrapper';
import SEO from '@/components/SEO';
import strings from '@/locales/en.json';
import {templatesListFilterState} from '@/utils/store';
import {TEMPLATE_TYPES, TEMPLATE_THEMES} from '@/utils/templates';
import {getUrlParamsFromObject} from '@/utils/helpers';
import {INTERVIEW_LANGUAGES} from '@/utils/interviews';

dayjs.extend(relativeTime);

const TemplatesIndexPage: React.FC = () => {
    const [listFilters, setListFilters] = useRecoilState(templatesListFilterState);
    const {currentPage, handlePageNext, handlePagePrevious, itemsOffset, itemsPerPage} =
        usePagination({itemsPerPage: 20});
    const {
        data: allTemplates,
        error,
        mutate
    } = useSWR(
        `/api/templates?${getUrlParamsFromObject(
            listFilters.filters
        )}&limit=${itemsPerPage}&offset=${itemsOffset}`
    );

    const handleListFilterChange = newFilters => {
        setListFilters({
            ...listFilters,
            filters: newFilters
        });
        // mutate(
        //     `/api/templates?${getUrlParamsFromObject(newFilters)}&limit=${itemsPerPage}&offset=0`
        // );
    };

    return (
        <PageWrapper>
            <SEO title={strings.templatesList.title} />
            <PageHeader
                CustomPrimaryCta={() => (
                    <Dropdown
                        label={strings.templatesList.create}
                        options={[
                            {
                                label: TEMPLATE_TYPES.consent,
                                url: '/templates/create/consent'
                            },
                            {
                                label: TEMPLATE_TYPES.probing_question,
                                url: '/templates/create/probing_question'
                            },
                            {label: TEMPLATE_TYPES.question, url: '/templates/create/question'}
                        ]}
                        theme="primary"
                    />
                )}
                title={strings.templatesList.title}
            />

            <div className="mb-4">
                <ListFilter
                    activeFilters={listFilters}
                    filters={strings.templatesList.filters}
                    handleFilterChange={handleListFilterChange}
                />
            </div>

            <APIView
                empty={strings.templatesList.empty}
                error={error}
                hasError={error}
                isEmpty={allTemplates && !allTemplates?.length}
                isLoading={!error && !allTemplates}
                loadingText="Fetching templates"
            >
                {allTemplates?.length &&
                    allTemplates.map((template, index) => (
                        <DataList
                            key={template.id}
                            actions={[
                                {
                                    icon: 'pencil',
                                    label: strings.templatesList.update,
                                    url: `/templates/${template.id}/update/${template.data.type}`
                                }
                            ]}
                            badges={[
                                {
                                    theme: TEMPLATE_THEMES[template.data.type],
                                    title: TEMPLATE_TYPES[template.data.type]
                                }
                            ]}
                            subtitle={`${
                                INTERVIEW_LANGUAGES[template.data.primary_language]
                            } &middot; Updated ${dayjs(template.data.updated_at).from(
                                new Date()
                            )} by ${template.data.updated_by}`}
                            title={template.data.title}
                        />
                    ))}
            </APIView>
            {(allTemplates?.length >= itemsPerPage || currentPage > 1) && (
                <>
                    <div className="mt-2" />
                    <Pagination
                        page={currentPage}
                        handleNext={handlePageNext}
                        handlePrevious={handlePagePrevious}
                        showNext={allTemplates?.length >= itemsPerPage}
                    />
                </>
            )}
        </PageWrapper>
    );
};

export default TemplatesIndexPage;
