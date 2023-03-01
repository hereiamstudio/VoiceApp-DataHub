import React from 'react';
import {render, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ClientOnly from '../../components/ClientOnly';

describe('Component: ClientOnly', () => {
    test('does not render on the server', async () => {
        const text = 'Foo bar baz';
        const {queryByText} = render(<ClientOnly>{text}</ClientOnly>);

        await waitFor(() => {
            expect(queryByText(text)).not.toBeInTheDocument();
        });
    });

    test('renders on the client', async () => {
        const text = 'Foo bar baz';
        const {getByText, queryByText} = render(<ClientOnly>{text}</ClientOnly>);

        // await waitFor(() => {
        //     expect(queryByText(text)).not.toBeInTheDocument();
        // });
        await waitFor(() => {
            expect(queryByText(text)).toBeInTheDocument();
        });
    });
});
