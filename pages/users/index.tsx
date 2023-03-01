import React, {useContext, useEffect, useState} from 'react';
import {useRecoilState} from 'recoil';
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
import SEO from '@/components/SEO';
import UsersExportModal from '@/components/UsersExportModal';
import UsersImportModal from '@/components/UsersImportModal';
import strings from '@/locales/en.json';
import {usersListFilterState} from '@/utils/store';
import {COUNTRIES} from '@/utils/countries';
import {ROLES, ROLES_THEMES} from '@/utils/roles';
import {getUrlParamsFromObject} from '@/utils/helpers';

dayjs.extend(relativeTime);

const UsersIndexPage: React.FC = () => {
    const {showModal} = useContext(ModalContext);
    const [hasDynamicFilterOptions, setHasDynamicFilterOptions] = useState<boolean>(false);
    const [listFiltersOptions, setListFiltersOptions] = useState(strings.usersList.filters);
    const [listFilters, setListFilters] = useRecoilState(usersListFilterState);
    const {
        currentPage,
        handlePageNext,
        handlePagePrevious,
        itemsOffset,
        itemsPerPage,
        resetPagination
    } = usePagination({itemsPerPage: 20});
    const {
        data: allUsers,
        error,
        mutate
    } = useSWR(
        `/api/users?${getUrlParamsFromObject(
            listFilters.filters
        )}&limit=${itemsPerPage}&offset=${itemsOffset}`
    );
    const {data: dynamicFilters, mutate: mutateDynamicFilters} = useSWR(
        hasDynamicFilterOptions ? `/api/users/filter-options` : null
    );

    const handleDynamicFilterFetch = () => {
        const updatedListFiltersOptions = listFiltersOptions.map(filter => {
            if (filter.field === 'project' && dynamicFilters.projects) {
                return {
                    ...filter,
                    options: dynamicFilters.projects
                };
            } else if (filter.field === 'country' && dynamicFilters.countries) {
                return {
                    ...filter,
                    options: dynamicFilters.countries
                };
            } else {
                return filter;
            }
        });

        setListFiltersOptions(updatedListFiltersOptions);
    };

    const handleListFilterChange = newFilters => {
        setListFilters({
            ...listFilters,
            filters: newFilters
        });
        resetPagination();
        // mutate(`/api/users?${getUrlParamsFromObject(newFilters)}&limit=${itemsPerPage}&offset=0`);
    };

    /**
     * Handle retrieval of dynamic filter options.
     */
    const handleListFilterOpen = filter => {
        if (['country', 'project'].includes(filter.field)) {
            const listFiltersOption = listFiltersOptions.find(i => i.field === filter.field);

            if (
                !listFiltersOption.options.length ||
                (listFiltersOption.options.length === 1 &&
                    listFiltersOption.options[0].label === 'Any')
            ) {
                setHasDynamicFilterOptions(true);
            }
        }
    };

    useEffect(() => {
        if (dynamicFilters) {
            handleDynamicFilterFetch();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dynamicFilters]);

    return (
        <PageWrapper>
            <SEO title={strings.usersList.title} />
            <PageHeader
                CustomPrimaryCta={
                    allUsers?.length
                        ? () => (
                              <>
                                  <Button
                                      icon="document-download"
                                      onClick={() => showModal('usersExport')}
                                  >
                                      Export users
                                  </Button>
                                  <Button
                                      classes="ml-3"
                                      icon="upload"
                                      onClick={() => showModal('usersImport')}
                                  >
                                      Import users
                                  </Button>
                              </>
                          )
                        : null
                }
                primaryCta={{
                    icon: 'plus',
                    label: strings.usersList.create,
                    url: '/users/create'
                }}
                secondaryCta={{
                    label: strings.usersList.invites,
                    url: '/users/invites'
                }}
                title={strings.usersList.title}
            />

            <div className="mb-4">
                <ListFilter
                    activeFilters={listFilters}
                    filters={listFiltersOptions}
                    handleFilterChange={handleListFilterChange}
                    handleFilterOpen={handleListFilterOpen}
                />
            </div>

            {allUsers?.length > 0 && <UsersExportModal title="All users export" />}
            <UsersImportModal title="Import users" />

            <APIView
                empty={strings.usersList.empty}
                error={error}
                hasError={error}
                isEmpty={allUsers && !allUsers?.length}
                isLoading={!error && !allUsers}
                loadingText="Fetching users"
            >
                {allUsers?.length &&
                    allUsers.map((user, index) => (
                        <DataList
                            key={user.id}
                            actions={[
                                {
                                    icon: 'pencil',
                                    label: strings.usersList.update,
                                    url: `/users/${user.id}/update`
                                }
                            ]}
                            badges={[
                                {
                                    theme: ROLES_THEMES[user.data.role],
                                    title: ROLES[user.data.role]
                                }
                            ]}
                            subtitle={`${COUNTRIES[user.data.country]} &middot; ${
                                user.data.company_name
                            } &middot; Updated ${dayjs(user.data.updated_at).from(new Date())} by ${
                                user.data.updated_by
                            }`}
                            title={`${user.data.first_name} ${user.data.last_name}`}
                        />
                    ))}
            </APIView>
            {(allUsers?.length >= itemsPerPage || currentPage > 1) && (
                <>
                    <div className="mt-2" />
                    <Pagination
                        page={currentPage}
                        handleNext={handlePageNext}
                        handlePrevious={handlePagePrevious}
                        showNext={allUsers?.length >= itemsPerPage}
                    />
                </>
            )}
        </PageWrapper>
    );
};

export default UsersIndexPage;
