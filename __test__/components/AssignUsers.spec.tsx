import React from 'react';
import faker from '@faker-js/faker';
import useSWR from 'swr';
import {fireEvent, render, waitFor} from '@testing-library/react';
import {within} from '@testing-library/dom';
import '@testing-library/jest-dom/extend-expect';
import AssignUsers from '../../components/AssignUsers';
import strings from '../../locales/en.json';

const users = Array.from(Array(5).keys()).map(index => ({
    id: faker.random.uuid(),
    // sometimes names can be duplicated, and we need them to be unique
    first_name: `${faker.name.firstName()} ${index})`,
    last_name: `${faker.name.lastName()} ${index})`,
    country: faker.address.country(),
    company_name: faker.company.companyName()
}));

jest.mock('swr');
// @ts-ignore
useSWR.mockImplementation(() => ({
    data: users
}));

describe.skip('Component: AssignUsers', () => {
    beforeEach(() => {
        fetchMock.resetMocks();
    });

    test('renders placeholder text when there is no assigned users', async () => {
        const assignedUsers = [];
        const endpoint = 'available-for-projects';
        const handleChange = jest.fn();

        const {getByText} = render(
            <AssignUsers
                assignedUsers={assignedUsers}
                endpoint={endpoint}
                handleChange={handleChange}
            />
        );

        await waitFor(() => {
            expect(getByText(strings.generic.assignUsers.placeholder)).toBeInTheDocument();
        });
    });

    test('renders a dropdown list of users to select from', async () => {
        const assignedUsers = [];
        const endpoint = 'available-for-projects';
        const handleChange = jest.fn();

        const {getByText} = render(
            <AssignUsers
                assignedUsers={assignedUsers}
                endpoint={endpoint}
                handleChange={handleChange}
            />
        );

        await waitFor(() => {
            users.map(user => {
                expect(getByText(`${user.first_name} ${user.last_name}`)).toBeInTheDocument();
            });
        });
    });

    test('renders a user in an "assigned" list once they have been selected and added', async () => {
        const assignedUsers = [];
        const endpoint = 'available-for-projects';
        const handleChange = jest.fn();

        const {getByTestId, getByText} = render(
            <AssignUsers
                assignedUsers={assignedUsers}
                endpoint={endpoint}
                handleChange={handleChange}
            />
        );

        fireEvent.change(getByTestId('assign-users-select'), {target: {value: 0}});

        await waitFor(() => {
            expect(
                within(getByTestId('assign-users-list')).getByText(users[0].first_name, {
                    exact: false
                })
            ).toBeInTheDocument();
        });
    });

    test('renders all users in an "assigned" list once they have been added', async () => {
        const assignedUsers = [];
        const endpoint = 'available-for-projects';
        const handleChange = jest.fn();

        const {getByTestId, debug} = render(
            <AssignUsers
                assignedUsers={assignedUsers}
                endpoint={endpoint}
                handleChange={handleChange}
            />
        );

        getByTestId('assign-users-add-all').click();

        await waitFor(() => {
            expect(
                within(getByTestId('assign-users-list')).getByText(users[0].first_name, {
                    exact: false
                })
            ).toBeInTheDocument();
            expect(
                within(getByTestId('assign-users-list')).getByText(
                    users[users.length - 1].first_name,
                    {
                        exact: false
                    }
                )
            ).toBeInTheDocument();
        });
    });

    test('renders all assigned users in alphabetical order', async () => {
        const assignedUsers = users;
        const sortedAssignedUsers = [...assignedUsers].sort((a, b) => {
            if (a.first_name < b.first_name) {
                return -1;
            } else if (a.first_name > b.first_name) {
                return 1;
            }
            return 0;
        });
        const endpoint = 'available-for-projects';
        const handleChange = jest.fn();

        const {getByTestId, debug} = render(
            <AssignUsers
                assignedUsers={assignedUsers}
                endpoint={endpoint}
                handleChange={handleChange}
            />
        );

        sortedAssignedUsers.forEach((user, index) => {
            expect(
                getByTestId('assign-users-list').children[index].innerHTML.includes(user.first_name)
            ).toBe(true);
        });
    });

    test('removes a user from the dropdown list once they have been selected and added to "assigned" users', async () => {
        const assignedUsers = [];
        const endpoint = 'available-for-projects';
        const handleChange = jest.fn();

        const {queryByText, getByTestId, getByText} = render(
            <AssignUsers
                assignedUsers={assignedUsers}
                endpoint={endpoint}
                handleChange={handleChange}
            />
        );

        fireEvent.change(getByTestId('assign-users-select'), {target: {value: 0}});

        await waitFor(() => {
            expect(
                within(getByTestId('assign-users-select')).queryByText(users[0].first_name, {
                    exact: false
                })
            ).not.toBeInTheDocument();
        });
    });

    test('sends the updated "assigned" users to a callback when added', async () => {
        const assignedUsers = [];
        const endpoint = 'available-for-projects';
        const handleChange = jest.fn();

        const {getByTestId, getByText} = render(
            <AssignUsers
                assignedUsers={assignedUsers}
                endpoint={endpoint}
                handleChange={handleChange}
            />
        );

        fireEvent.change(getByTestId('assign-users-select'), {target: {value: 0}});

        await waitFor(() => {
            expect(handleChange).toHaveBeenCalledWith([users[0]]);
        });
    });

    test.skip('removes a user from the "selected" list when they have been removed', async () => {
        const assignedUsers = [];
        const endpoint = 'available-for-projects';
        const handleChange = jest.fn();

        const {queryByText, getByTestId, getByText} = render(
            <AssignUsers
                assignedUsers={assignedUsers}
                endpoint={endpoint}
                handleChange={handleChange}
            />
        );

        fireEvent.change(getByTestId('assign-users-select'), {target: {value: 0}});
        within(getByTestId('assign-users-list'))
            .queryByText(users[0].first_name, {exact: false})
            .click();

        await waitFor(() => {
            expect(
                within(getByTestId('assign-users-list')).queryByText(users[0].first_name, {
                    exact: false
                })
            ).not.toBeInTheDocument();
        });
    });

    test('sends the updated "assigned" users to a callback when removed', async () => {
        const assignedUsers = [];
        const endpoint = 'available-for-projects';
        const handleChange = jest.fn();

        const {getByTestId, getByText} = render(
            <AssignUsers
                assignedUsers={assignedUsers}
                endpoint={endpoint}
                handleChange={handleChange}
            />
        );

        fireEvent.change(getByTestId('assign-users-select'), {target: {value: 0}});

        await waitFor(() => {
            expect(handleChange).toHaveBeenCalledWith([]);
        });
    });

    test('sends the updated "assigned" users to a callback when removed', async () => {
        const assignedUsers = [];
        const endpoint = 'available-for-projects';
        const handleChange = jest.fn();

        const {getByTestId, getByText} = render(
            <AssignUsers
                assignedUsers={assignedUsers}
                endpoint={endpoint}
                handleChange={handleChange}
            />
        );

        fireEvent.change(getByTestId('assign-users-select'), {target: {value: 0}});

        await waitFor(() => {
            expect(handleChange).toHaveBeenCalledWith([]);
        });
    });

    test('prevents removal of a user if they are an "owner"', async () => {
        const assignedUsers = [];
        const endpoint = 'available-for-projects';
        const handleChange = jest.fn();

        const {queryByText, getByTestId, getByText} = render(
            <AssignUsers
                assignedUsers={assignedUsers}
                endpoint={endpoint}
                handleChange={handleChange}
                ownerId={users[0].id}
            />
        );

        fireEvent.change(getByTestId('assign-users-select'), {target: {value: 0}});
        within(getByTestId('assign-users-list'))
            .queryByText(users[0].first_name, {exact: false})
            .click();

        await waitFor(() => {
            expect(
                within(getByTestId('assign-users-list')).queryByText(users[0].first_name, {
                    exact: false
                })
            ).toBeInTheDocument();
        });
    });

    test('renders a label if an added user is the current authenticated user', async () => {
        const assignedUsers = [users[0]];
        const endpoint = 'available-for-projects';
        const handleChange = jest.fn();

        const {queryByText, getByTestId, getByText} = render(
            <AssignUsers
                activeUserId={users[0].id}
                assignedUsers={assignedUsers}
                endpoint={endpoint}
                handleChange={handleChange}
            />
        );

        expect(
            within(getByTestId('assign-users-list')).queryByText(strings.generic.isActiveUser, {
                exact: false
            })
        ).toBeInTheDocument();
    });
});
