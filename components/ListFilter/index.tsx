import React from 'react';
import Dropdown from './Dropdown';
import type {ListFilters} from '@/types/index';

interface Props {
    activeFilters?: any;
    handleFilterChange: Function;
    handleFilterOpen?: Function;
    handleSortChange?: Function;
    filters: ListFilters;
    sorts?: ListFilters[0]['options'];
}

const ListFilter: React.FC<Props> = ({
    activeFilters = {},
    handleFilterChange,
    handleFilterOpen = () => {},
    handleSortChange = () => {},
    filters,
    sorts
}: Props) => {
    if (!filters.length) {
        return null;
    }

    return (
        <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
                <span className="pr-1 text-xs font-semibold text-gray-500">Filter</span>
                {filters.map((filter, index) => {
                    if (filter.options.length === 0) {
                        filter.options = [
                            {
                                label: 'Any',
                                value: 'any'
                            }
                        ];
                    }

                    return (
                        <Dropdown
                            key={filter.title}
                            activeFilters={activeFilters.filters}
                            filter={filter}
                            handleChange={option => {
                                handleFilterChange({
                                    ...activeFilters.filters,
                                    ...{[filter.field]: option.value}
                                });
                            }}
                            handleOpen={handleFilterOpen}
                            type="filter"
                        />
                    );
                })}
            </div>
            {sorts && (
                <div className="flex items-center space-x-1">
                    <span className="pr-1 text-xs font-semibold text-gray-500">Sort</span>
                    <Dropdown
                        activeFilters={activeFilters.sort}
                        filter={{
                            title: '',
                            field: '',
                            options: sorts
                        }}
                        handleChange={option => {
                            handleSortChange(option.value);
                        }}
                        type="sort"
                    />
                </div>
            )}
        </div>
    );
};

export default ListFilter;
