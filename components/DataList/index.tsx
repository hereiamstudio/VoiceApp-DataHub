import React from 'react';
import Badge from '@/components/Badge';
import Dropdown from '@/components/Dropdown';
import type {DataList} from '@/types/index';

const DataListComponent: React.FC<DataList> = ({
    actions,
    actionsLabel = 'Actions',
    badges = [],
    id,
    subtitle,
    title
}: DataList) => (
    <div
        className="mb-3 bg-white shadow transition-all duration-200 hover:shadow-md sm:rounded-lg"
        data-component="data-list"
        data-testid={id}
    >
        <div className="border-b border-gray-200 px-4 py-3 sm:flex sm:items-center sm:justify-between sm:px-6">
            <div className="flex-grow">
                <h3 className="text-md flex-grow font-medium leading-6 text-gray-900">{title}</h3>
                {subtitle && (
                    <div
                        className="mt-1 text-xs leading-5 text-gray-500"
                        dangerouslySetInnerHTML={{__html: subtitle}}
                    />
                )}
            </div>
            {badges.length > 0 && (
                <div className="my-4 sm:my-0 sm:mx-4 sm:flex sm:flex-shrink-0 sm:items-center">
                    {badges
                        .filter(b => b)
                        .map((badge, index) => (
                            <span
                                key={badge.title}
                                className={`flex-shrink-0 ${index > 0 ? 'ml-2 sm:ml-4' : ''}`}
                            >
                                <Badge theme={badge.theme}>{badge.title}</Badge>
                            </span>
                        ))}
                </div>
            )}
            {actions && <Dropdown label={actionsLabel} options={actions} />}
        </div>
    </div>
);

export default DataListComponent;
