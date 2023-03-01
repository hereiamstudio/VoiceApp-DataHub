import React from 'react';
import useSWR from 'swr';
import Badge from '@/components/Badge';
import Link from '@/components/Link';
import strings from '@/locales/en.json';
import {INTERVIEW_STATUSES_THEMES} from '@/utils/interviews';

interface Props {
    id: string;
}

const UserProjectsList: React.FC<Props> = ({id}: Props) => {
    const {data, isValidating} = useSWR(`/api/users/${id}/project-list`);

    return (
        <div className="shadow sm:overflow-hidden sm:rounded-md">
            <div className="bg-white px-4 py-5 text-sm leading-5 text-gray-700 sm:p-6">
                {data && Object.keys(data)?.length > 0 ? (
                    <div className="space-y-4 divide-y" data->
                        {Object.keys(data).map((key, index) => (
                            <div key={key} className={index > 0 ? 'pt-4' : ''}>
                                <Link
                                    className="text font-medium duration-200 ease-out hover:text-black hover:underline"
                                    title="Edit project"
                                    url={`/projects/${data[key].project.id}/update`}
                                >
                                    {key}
                                </Link>
                                {data[key].interviews.map((interview, index) => (
                                    <div
                                        key={interview.id}
                                        className="mt-2 flex items-center space-x-4 text-sm"
                                    >
                                        <Link
                                            className="flex w-full items-center duration-200 ease-out hover:text-black hover:underline"
                                            title="Edit interview"
                                            url={`/projects/${data[key].project.id}/interviews/${interview.id}/update`}
                                        >
                                            <span className="flex-grow">{interview.title}</span>
                                            <Badge
                                                theme={INTERVIEW_STATUSES_THEMES[interview.status]}
                                            >
                                                {strings.interviewsList[interview.status]}
                                            </Badge>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div>{strings.usersUpdate.projectsList.empty}</div>
                )}
            </div>
        </div>
    );
};

export default UserProjectsList;
