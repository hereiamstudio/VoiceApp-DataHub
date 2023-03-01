import React from 'react';
import {render, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import APIView from '../../components/APIView';
import strings from '../../locales/en.json';

describe('Component: APIView', () => {
    test('renders a default loading spinner if data is loading', async () => {
        const hasError = false;
        const isLoading = true;
        const data = 'Data message';
        const {getByTestId, queryByText} = render(
            <APIView hasError={hasError} isLoading={isLoading}>
                {data}
            </APIView>
        );

        expect(getByTestId('activity-indicator')).toBeInTheDocument();
        await waitFor(() => expect(queryByText(data)).not.toBeInTheDocument());
    });

    test('renders a custom loading message if data is loading', async () => {
        const hasError = false;
        const isLoading = true;
        const loading = 'Loading message';
        const data = 'Data message';
        const {getByText, queryByText} = render(
            <APIView hasError={hasError} isLoading={isLoading} loading={loading}>
                {data}
            </APIView>
        );

        expect(getByText(loading)).toBeInTheDocument();
        await waitFor(() => expect(queryByText(data)).not.toBeInTheDocument());
    });

    test('renders an error message if an error occurred', async () => {
        const hasError = true;
        const isLoading = false;
        const loading = 'Loading message';
        const data = 'Data message';
        const {getByText, queryByText} = render(
            <APIView hasError={hasError} isLoading={isLoading} loading={loading}>
                {data}
            </APIView>
        );

        expect(getByText(strings.generic.apiError)).toBeInTheDocument();
        await waitFor(() => expect(queryByText(loading)).not.toBeInTheDocument());
        await waitFor(() => expect(queryByText(data)).not.toBeInTheDocument());
    });

    test('renders a custom error message if an error occurred', async () => {
        const error = 'Error message';
        const hasError = true;
        const isLoading = false;
        const loading = 'Loading message';
        const data = 'Data message';
        const {getByText, queryByText} = render(
            <APIView error={error} hasError={hasError} isLoading={isLoading} loading={loading}>
                {data}
            </APIView>
        );

        expect(getByText(error)).toBeInTheDocument();
        await waitFor(() => expect(queryByText(loading)).not.toBeInTheDocument());
        await waitFor(() => expect(queryByText(data)).not.toBeInTheDocument());
    });

    test('renders child component if no error and not loading', async () => {
        const error = 'Error message';
        const hasError = false;
        const isLoading = false;
        const loading = 'Loading message';
        const data = 'Data message';
        const {getByText, queryByText} = render(
            <APIView error={error} hasError={hasError} isLoading={isLoading} loading={loading}>
                {data}
            </APIView>
        );

        expect(getByText(data)).toBeInTheDocument();
        await waitFor(() => expect(queryByText(error)).not.toBeInTheDocument());
        await waitFor(() => expect(queryByText(loading)).not.toBeInTheDocument());
    });
});
