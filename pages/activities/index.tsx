import React from 'react';
import {useRouter} from 'next/router';
import {useRecoilState} from 'recoil';
import useSWR from 'swr';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import find from 'lodash/find';
import get from 'lodash/get';
import ActivityActionLink from '@/components/ActivityActionLink';
import APIView from '@/components/APIView';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import Link from '@/components/Link';
import ListFilter from '@/components/ListFilter';
import PageHeader from '@/components/PageHeader';
import Pagination from '@/components/Pagination';
import usePagination from '@/components/Pagination/usePagination';
import PageWrapper from '@/components/PageWrapper';
import SEO from '@/components/SEO';
import strings from '@/locales/en.json';
import {activitiesListFilterState} from '@/utils/store';
import type {Activity} from '@/types/activity';
import {getUrlParamsFromObject} from '@/utils/helpers';
import {ColourTheme} from '@/types/index';

dayjs.extend(relativeTime);

const ActivityIndexPage: React.FC = () => {
    const router = useRouter();
    const userId = router.query.user?.toString();
    const [listFilters, setListFilters] = useRecoilState(activitiesListFilterState);
    const {
        currentPage,
        handlePageNext,
        handlePagePrevious,
        itemsOffset,
        itemsPerPage,
        resetPagination
    } = usePagination({itemsPerPage: 40});
    const {
        data: allActivities,
        error,
        mutate
    } = useSWR(
        `/api/activities?${getUrlParamsFromObject(
            listFilters.filters
        )}&limit=${itemsPerPage}&offset=${itemsOffset}${userId ? `&userId=${userId}` : ''}`
    );

    const handleListFilterChange = newFilters => {
        setListFilters({
            ...listFilters,
            filters: newFilters
        });
        resetPagination();
        // mutate(`/api/activitys?${getUrlParamsFromObject(newFilters)}&limit=${itemsPerPage}&offset=0`);
    };

    return (
        <PageWrapper>
            <SEO title={strings.activitiesList.title} />
            <PageHeader title={strings.activitiesList.title} />

            <div className="mb-6 sm:flex sm:items-center sm:justify-between">
                <ListFilter
                    activeFilters={listFilters}
                    filters={strings.activitiesList.filters}
                    handleFilterChange={handleListFilterChange}
                />
                {userId && (
                    <Button
                        classes="ml-4"
                        icon="cross"
                        iconPosition="left"
                        theme="white"
                        url="/activities"
                    >
                        Clear user filter
                    </Button>
                )}
            </div>

            <APIView
                empty={strings.activitiesList.empty}
                error={error}
                hasError={error}
                isEmpty={allActivities && !allActivities?.length}
                isLoading={!error && !allActivities}
                loadingText="Fetching activities"
            >
                <div className="overflow-hidden border-b border-gray-200 shadow sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {strings.activitiesList.headings.map(heading => (
                                    <th
                                        key={heading}
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                                    >
                                        {heading}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {allActivities?.length &&
                                allActivities.map((activity, index) => (
                                    <tr key={activity.email}>
                                        <td className="w-5/12 whitespace-nowrap px-6 py-3 text-sm">
                                            <ActivityActionLink activity={activity.data} />
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-3">
                                            <Badge
                                                theme={
                                                    get(
                                                        find(
                                                            strings.activitiesList.filters[0]
                                                                .options,
                                                            i => i.value === activity.data.type
                                                        ),
                                                        'theme'
                                                    ) as ColourTheme
                                                }
                                            >
                                                {activity.data.type}
                                            </Badge>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-3 text-sm">
                                            <Link
                                                classes="hover:underline"
                                                url={`/users/${activity.data.created_by.id}/update`}
                                            >
                                                {activity.data.created_by.first_name}{' '}
                                                {activity.data.created_by.last_name}
                                            </Link>
                                            {!userId && (
                                                <Link
                                                    classes="duration-200 ease-out ml-3 transition text-gray-500 text-xs hover:text-gray-800 hover:underline"
                                                    url={`/activities?user=${activity.data.created_by.id}`}
                                                >
                                                    Filter
                                                </Link>
                                            )}
                                        </td>
                                        <td
                                            className="whitespace-nowrap px-6 py-3 text-sm text-gray-500"
                                            title={activity.data.created_at}
                                        >
                                            {dayjs(activity.data.created_at).from(new Date())}
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </APIView>
            {(allActivities?.length >= itemsPerPage || currentPage > 1) && (
                <>
                    <div className="mt-2" />
                    <Pagination
                        page={currentPage}
                        handleNext={handlePageNext}
                        handlePrevious={handlePagePrevious}
                        showNext={allActivities?.length >= itemsPerPage}
                    />
                </>
            )}
        </PageWrapper>
    );
};

export default ActivityIndexPage;
