import React, {useEffect, useState} from 'react';
import useSWR from 'swr';
import sortBy from 'lodash/sortBy';
import ActivityIndicator from '@/components/ActivityIndicator';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import Icon from '@/components/Icon';
import Tooltip from '@/components/Tooltip';
import strings from '@/locales/en.json';

interface Props {
    activeUserId?: number;
    assignedUsers: {
        first_name: string;
        id: string;
        last_name: string;
    }[];
    canRemoveUsers?: boolean;
    endpoint: string;
    handleChange: Function;
    isLocked: boolean;
    ownerId?: string;
    projectId?: string;
}

const AssignUsers: React.FC<Props> = ({
    activeUserId,
    assignedUsers = [],
    canRemoveUsers = true,
    endpoint,
    handleChange,
    isLocked,
    ownerId,
    projectId
}: Props) => {
    const {data: availableUsers, isValidating} = useSWR(
        `/api/users/${endpoint}?projectId=${projectId}`
    );
    const [assignedUsersIds] = useState(assignedUsers.map(u => u.id));
    const [hasSetDefaultUsers, setHasSetDefaultUsers] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectedUsersIds, setSelectedUsersIds] = useState([]);

    /**
     * The select field will return the index of the selected item from the
     * `availableUsers` list.
     */
    const handleSelect = event => {
        const {value} = event.target;

        setSelectedUsers([...selectedUsers, availableUsers[value]]);
        setSelectedUsersIds([...selectedUsersIds, availableUsers[value].id]);
    };

    const handleRemove = (uid: string) => {
        if (ownerId && ownerId === uid) {
            return;
        }

        setSelectedUsers(selectedUsers.filter(user => user.id !== uid));
        setSelectedUsersIds(selectedUsersIds.filter(id => id !== uid));
    };

    const handleAddAll = () => {
        setSelectedUsers(availableUsers);
        setSelectedUsersIds(availableUsers.map(i => i.id));
    };

    useEffect(() => {
        if (!hasSetDefaultUsers && !isValidating && availableUsers) {
            if (assignedUsers.length > 0) {
                const defaultSelectedUsers = assignedUsers
                    .map(user => availableUsers.find(u => u.id === user.id))
                    .filter(u => u);

                if (defaultSelectedUsers.length) {
                    setHasSetDefaultUsers(true);
                    setSelectedUsers(defaultSelectedUsers);
                    setSelectedUsersIds(defaultSelectedUsers.map(u => u.id));
                }
            } else {
                setHasSetDefaultUsers(true);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [availableUsers, isValidating]);

    /**
     * Every time a user is added or removed we want to send the updated list back to the
     * parent component (where the form is located).
     */
    useEffect(() => {
        handleChange(selectedUsers);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedUsers]);

    return (
        <div className="grid grid-cols-12 gap-8">
            {!isLocked && (
                <div className="col-span-12 sm:col-span-5">
                    <label
                        htmlFor="assign_users_select"
                        className="flex items-center space-x-2 font-medium leading-5 text-gray-700 sm:text-sm"
                    >
                        <span>{strings.generic.assignUsers.assigned_users_select.label}</span>
                        <Badge theme="orange">
                            {availableUsers?.length - selectedUsers?.length}
                        </Badge>
                    </label>

                    <select
                        className="form-select focus:shadow-outline-pink mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm transition duration-150 ease-in-out focus:border-pink-300 focus:outline-none focus:ring-0 active:outline-none sm:text-sm sm:leading-5"
                        data-testid="assign-users-select"
                        disabled={selectedUsers?.length === availableUsers?.length}
                        id="assign_users_select"
                        name="assign_users_select"
                        onChange={handleSelect}
                    >
                        <option>
                            {availableUsers?.length > selectedUsers?.length
                                ? strings.generic.assignUsers.assigned_users_select.placeholder
                                : 'All users have been assigned'}
                        </option>
                        {availableUsers &&
                            availableUsers
                                .map((user, usersIndex) => {
                                    /**
                                     * We're not using filter on this array because we need the indexes to
                                     * stay intact to keep the "lookup" simple.
                                     */
                                    if (!selectedUsersIds.includes(user.id)) {
                                        return (
                                            <option key={user.id} value={usersIndex}>
                                                {user.first_name} {user.last_name} (
                                                {user.company_name}, {user.country})
                                            </option>
                                        );
                                    }
                                })
                                .filter(option => {
                                    /**
                                     * Here we can filter out any unused options. This means we can keep array
                                     * indexes intact and also not output users who can't be selected.
                                     */
                                    return option;
                                })}
                    </select>
                    {selectedUsers?.length < availableUsers?.length && (
                        <div className="animate-fade-in">
                            <div className="relative my-2">
                                <div
                                    className="absolute inset-0 flex items-center"
                                    aria-hidden="true"
                                >
                                    <div className="w-full border-t border-gray-200" />
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-white px-2 text-sm text-gray-500">or</span>
                                </div>
                            </div>
                            <Button
                                classes="justify-center w-full"
                                data-testid="assign-users-add-all"
                                onClick={handleAddAll}
                                theme="secondary"
                            >
                                {strings.generic.assignUsers.addAll}
                            </Button>
                        </div>
                    )}
                </div>
            )}
            <div className="col-span-12 sm:col-span-7">
                <strong className="flex items-center space-x-2 font-medium leading-5 text-gray-700 sm:text-sm">
                    <span>{strings.generic.assignUsers.selected}</span>
                    <Badge theme="orange">{selectedUsers.length}</Badge>
                </strong>
                {selectedUsers.length > 0 ? (
                    <ul
                        className="mt-1 list-inside divide-y divide-gray-200 text-sm text-gray-600"
                        data-testid="assign-users-list"
                    >
                        {sortBy(selectedUsers, ['first_name', 'last_name']).map(user => {
                            const isActiveUser = activeUserId === user.id;
                            const isOwner = ownerId === user.id;
                            let canRemove = true;

                            if (
                                (!canRemoveUsers && assignedUsersIds.includes(user.id)) ||
                                ownerId === user.id
                            ) {
                                canRemove = false;
                            }

                            return (
                                <li
                                    key={user.id}
                                    className="flex animate-fade-in items-center space-x-2 py-2"
                                >
                                    <span className="flex-grow sm:text-sm sm:leading-5">
                                        <span className="flex items-center space-x-2">
                                            <span>
                                                {user.first_name} {user.last_name}
                                            </span>
                                            {isOwner && (
                                                <Badge theme="yellow">
                                                    {strings.generic.isOwner}
                                                </Badge>
                                            )}
                                            {isActiveUser && (
                                                <Badge theme="yellow">
                                                    {strings.generic.isActiveUser}
                                                </Badge>
                                            )}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {user.company_name}, {user.country}{' '}
                                        </span>
                                    </span>
                                    {!isLocked && canRemove && (
                                        <button type="button" onClick={() => handleRemove(user.id)}>
                                            <Tooltip text="Remove user">
                                                <Icon
                                                    classes="h-5 w-5 flex-shrink-0 scale-90 hover:scale-100 hover:text-red-500 transition duration-200 ease-in-out"
                                                    name="trash"
                                                />
                                            </Tooltip>
                                        </button>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <div
                        className="h-15 mt-2 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-4"
                        data-testid="assign-users-list"
                    >
                        <span className="text-gray-500 sm:text-sm">
                            {hasSetDefaultUsers ? (
                                strings.generic.assignUsers.placeholder
                            ) : (
                                <ActivityIndicator />
                            )}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssignUsers;
