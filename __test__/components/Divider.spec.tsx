import React from 'react';
import {render} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Divider from '../../components/Divider';

describe('Component: Divider', () => {
    test('renders ', async () => {
        const {getByTestId} = render(<Divider />);

        expect(getByTestId('divider')).toBeInTheDocument();
    });
});
