import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import ActivityIndicator from '@/components/ActivityIndicator';
import Icon from '@/components/Icon';
import type {ListFilter} from '@/types/index';

interface Props {
    activeFilters?: Object;
    handleChange: Function;
    handleOpen?: Function;
    filter: ListFilter;
    type: 'filter' | 'sort';
}

const ListFilterDropdown: React.FC<Props> = ({
    activeFilters,
    handleChange,
    handleOpen,
    filter,
    type = 'filter'
}: Props) => {
    const getSelectedOption = currentFilter => {
        let label = '';

        if (type === 'filter') {
            if (activeFilters?.[currentFilter.field]) {
                label = currentFilter.options.find(
                    i => i.value == activeFilters[currentFilter.field]
                )?.label;
            } else if (currentFilter.options.length) {
                label = currentFilter.options[0].label;
            }
        } else {
            label = currentFilter.options.find(i => i.value == activeFilters)?.label;
        }

        return label;
    };

    const selectedOption = getSelectedOption(filter);

    return (
        <DropdownMenu.Root
            key={filter.title}
            onOpenChange={() => {
                if (handleOpen) {
                    handleOpen(filter);
                }
            }}
        >
            <DropdownMenu.Trigger className="focus:shadow-outline-pink flex items-center overflow-hidden rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 duration-200 ease-in-out hover:border-gray-300 hover:bg-gray-50 focus:outline-none">
                {type === 'filter' && (
                    <span className="mr-1 font-semibold text-gray-600">{filter.title}</span>
                )}
                <span className="truncate overflow-ellipsis font-sans text-gray-500">
                    &nbsp;{selectedOption}
                </span>
                <Icon
                    name="chevron-right"
                    classes="duration-200 ease-out h-4 rotate-90 translate-x-1 transform transition w-4"
                />
            </DropdownMenu.Trigger>
            {filter.options.length > 0 && (
                <DropdownMenu.Content
                    align="end"
                    className="relative max-h-96 max-w-sm overflow-scroll rounded-lg border border-gray-200 bg-white py-3 pl-4 pr-8 shadow-xl"
                >
                    {filter.options.map(option => {
                        const isActive =
                            activeFilters?.[filter.field] === option.value ||
                            selectedOption === option.label;

                        return (
                            <>
                                <DropdownMenu.Item
                                    key={option.label}
                                    className={`${
                                        isActive
                                            ? 'font-medium text-gray-800'
                                            : 'font-regular text-gray-500'
                                    } group mb-2 flex cursor-pointer items-center space-x-2 text-sm hover:text-gray-800 focus:outline-none active:text-gray-700`}
                                    onSelect={() => handleChange(option)}
                                >
                                    <span
                                        className={`h-3 w-3 rounded-full border-2 transition duration-200 ease-out ${
                                            isActive
                                                ? `border-pink-500 bg-pink-400`
                                                : `group-focus:shadow-outline-pink border-gray-200 group-hover:border-pink-500 group-focus:border-pink-500`
                                        }`}
                                    />
                                    <span>{option.label}</span>
                                </DropdownMenu.Item>
                                {['All', 'Any'].includes(option.label) && (
                                    <DropdownMenu.Separator className="my-2 h-0.5 bg-gray-100" />
                                )}
                            </>
                        );
                    })}
                    {filter.options.length === 1 && (
                        <div className="m-auto h-5 w-5 text-gray-500">
                            <ActivityIndicator />
                        </div>
                    )}
                    <div className="fixed bottom-0 left-0 h-6 w-full overflow-hidden rounded-lg  bg-gradient-to-t from-white"></div>
                    <div className="fixed top-0 left-0 h-6 w-full overflow-hidden rounded-lg  bg-gradient-to-b from-white"></div>
                    <DropdownMenu.Arrow className="fill-current text-gray-300" offset={12} />
                </DropdownMenu.Content>
            )}
        </DropdownMenu.Root>
    );
};

export default ListFilterDropdown;
