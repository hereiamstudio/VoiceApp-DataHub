import React from 'react';
import {render} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import EmptyPanel from '../../components/EmptyPanel';

describe('Component: EmptyPanel', () => {
    test('renders a child component', async () => {
        const text = 'Foo bar baz';
        const {getByText} = render(<EmptyPanel>{text}</EmptyPanel>);

        expect(getByText(text)).toBeInTheDocument();
    });
});
