import React from 'react';
import {render, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Dropdown from '../../components/Dropdown';

describe('Component: Dropdown', () => {
    test('renders a label', async () => {
        const label = 'Foo';
        const options = [
            {icon: 'archive', label: 'Archive'},
            {icon: 'pencil', label: 'Update'}
        ];
        const {getByText} = render(<Dropdown label={label} options={options} />);

        expect(getByText(label)).toBeInTheDocument();
    });

    test('renders options when the dropdown button is toggled', async () => {
        const label = 'Foo';
        const options = [
            {icon: 'archive', label: 'Archive'},
            {icon: 'pencil', label: 'Update'}
        ];
        const {getByTestId, getByText} = render(<Dropdown label={label} options={options} />);
        getByTestId('options-menu').click();

        await waitFor(() => {
            expect(getByText('Archive')).toBeInTheDocument();
        });
    });
});
