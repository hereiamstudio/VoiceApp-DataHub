import React from 'react';
import {render} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ActivityIndicator from '../../components/ActivityIndicator';

describe('Component: ActivityIndicator', () => {
    test('renders ', async () => {
        const {getByTestId} = render(<ActivityIndicator />);

        expect(getByTestId('activity-indicator')).toBeInTheDocument();
    });
});
