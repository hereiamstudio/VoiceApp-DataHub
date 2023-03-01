import React from 'react';
import {render, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Banner from '../../components/Banner';

describe('Component: Banner', () => {
    test('renders a message', async () => {
        const text = 'Foo bar baz';
        const {getByText} = render(<Banner text={text} />);

        expect(getByText(text)).toBeInTheDocument();
    });

    test('does not render after being dismissed', async () => {
        const text = 'Foo bar baz';
        const {getByTestId, queryByText} = render(<Banner text={text} />);

        getByTestId('dismiss').click();

        await waitFor(() => {
            expect(queryByText(text)).not.toBeInTheDocument();
        });
    });
});
