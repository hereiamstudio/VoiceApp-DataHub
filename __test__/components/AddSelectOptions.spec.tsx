import React from 'react';
import faker from '@faker-js/faker';
import {fireEvent, render, waitFor} from '@testing-library/react';
import {within} from '@testing-library/dom';
import '@testing-library/jest-dom/extend-expect';
import AddSelectOptions from '../../components/AddSelectOptions';
import strings from '../../locales/en.json';

describe.skip('Component: AddSelectOptions', () => {
    test('renders a text field for adding options', async () => {
        const options = [];
        const option = faker.lorem.words();
        const handleChange = jest.fn();

        const {getByPlaceholderText, getByText} = render(
            <AddSelectOptions options={options} handleChange={handleChange} />
        );

        expect(
            getByPlaceholderText(strings.questionsCreate.details.optionsList.placeholder)
        ).toBeInTheDocument();
    });

    test('renders a default list of existing options', async () => {
        const options = ['Foo', 'Bar', 'Baz'];
        const option = faker.lorem.words();
        const handleChange = jest.fn();

        const {getByText} = render(
            <AddSelectOptions options={options} handleChange={handleChange} />
        );

        await waitFor(() => {
            expect(getByText(options[0])).toBeInTheDocument();
            expect(getByText(options[1])).toBeInTheDocument();
            expect(getByText(options[2])).toBeInTheDocument();
        });
    });

    test('renders an option in a list once text has been added', async () => {
        const options = [];
        const option = faker.lorem.words();
        const handleChange = jest.fn();

        const {getByTestId, getByText} = render(
            <AddSelectOptions options={options} handleChange={handleChange} />
        );

        fireEvent.change(getByTestId('add-option-text'), {target: {value: option}});
        getByTestId('add-option-add').click();

        await waitFor(() => {
            expect(within(getByTestId('options-list')).getByText(option)).toBeInTheDocument();
        });
    });

    test('sends the updated options to a callback when added', async () => {
        const options = [];
        const option = faker.lorem.words();
        const handleChange = jest.fn();

        const {getByTestId, getByText} = render(
            <AddSelectOptions options={options} handleChange={handleChange} />
        );

        fireEvent.change(getByTestId('add-option-text'), {target: {value: option}});
        getByTestId('add-option-add').click();

        await waitFor(() => {
            expect(handleChange).toHaveBeenCalledWith([option]);
        });
    });

    test('removes an option from the "options" list when it has been removed', async () => {
        const options = [];
        const option = faker.lorem.words();
        const handleChange = jest.fn();

        const {debug, queryByText, getByTestId, getByText} = render(
            <AddSelectOptions options={options} handleChange={handleChange} />
        );

        fireEvent.change(getByTestId('add-option-text'), {target: {value: option}});
        getByTestId('add-option-add').click();

        await waitFor(() => {
            within(getByTestId('options-list')).queryByText(option).click();
            expect(within(getByTestId('options-list')).queryByText(option)).not.toBeInTheDocument();
        });
    });

    test('sends the updated options to a callback when removed', async () => {
        const options = [];
        const option = faker.lorem.words();
        const handleChange = jest.fn();

        const {getByTestId, getByText} = render(
            <AddSelectOptions options={options} handleChange={handleChange} />
        );

        fireEvent.change(getByTestId('add-option-text'), {target: {value: option}});
        getByTestId('add-option-add').click();

        await waitFor(() => {
            expect(handleChange).toHaveBeenCalledWith([]);
        });
    });
});
