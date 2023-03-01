import React from 'react';
import {useRouter} from 'next/router';
import Link from '@/components/Link';
import strings from '@/locales/en.json';
import {InterviewTabBarItem} from '@/types/interview';

interface Props {
    activeTab: string; //InterviewTabBarItem;
    interviewId: string;
    interviewStatus: string;
    projectId: string;
}

const InterviewTabBar: React.FC<Props> = ({
    activeTab,
    interviewId,
    interviewStatus,
    projectId
}: Props) => {
    const tabs = Object.keys(InterviewTabBarItem);
    const router = useRouter();
    const statusColours = {
        draft: 'bg-red-500',
        active: 'bg-orange-400',
        complete: 'bg-green-500'
    };

    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const tab = event.currentTarget.value;

        router.replace(
            `/projects/${projectId}/interviews/${interviewId}/${InterviewTabBarItem[tab]}`
        );
    };

    return (
        <div className="mb-6 sm:mb-8">
            <div className="sm:hidden">
                <select
                    aria-label="Selected tab"
                    className="form-select focus:shadow-outline-blue mt-1 block w-full rounded border-gray-300 py-2 pl-3 pr-10 text-sm leading-6 transition duration-150 ease-in-out focus:border-blue-300 focus:outline-none sm:leading-5"
                    onChange={handleSelectChange}
                >
                    {tabs.map(tab => (
                        <option key={tab} selected={activeTab.toUpperCase() === tab} value={tab}>
                            {strings.interviewsTabBar[tab.toLowerCase()]}
                        </option>
                    ))}
                </select>
            </div>
            <div className="hidden sm:block">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8">
                        {tabs.map((tab, index) => (
                            <Link
                                key={tab}
                                className={`whitespace-no-wrap flex items-center space-x-3 border-b-2 py-4 px-1 text-sm font-medium leading-5 focus:outline-none ${
                                    activeTab.toUpperCase() === tab
                                        ? 'border-pink-500 text-pink-600 focus:border-pink-700 focus:text-pink-800'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 focus:border-gray-300 focus:text-gray-700'
                                }`}
                                url={`/projects/${projectId}/interviews/${interviewId}/${InterviewTabBarItem[tab]}`}
                            >
                                {tab === 'OVERVIEW' && (
                                    <span
                                        className={`inline-block h-2 w-2 rounded-full ${statusColours[interviewStatus]}`}
                                    />
                                )}
                                <span>{strings.interviewsTabBar[tab.toLowerCase()]}</span>
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default InterviewTabBar;
