import React from 'react';
import {render} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import PasswordCriteria from '../../components/PasswordCriteria';

describe('Component: PasswordCriteria', () => {
    const criteria = {
        length: 'Must be X length',
        alphanumeric: 'Must be alphanumeric'
    };

    test('renders text criteria', async () => {
        const {getByText} = render(<PasswordCriteria criteria={criteria} password="" />);

        expect(getByText(criteria.length)).toBeInTheDocument();
        expect(getByText(criteria.alphanumeric)).toBeInTheDocument();
    });

    test('renders successful when min length is validated', async () => {
        const {debug, getAllByTestId} = render(
            <PasswordCriteria criteria={criteria} password="abcdefghijk" />
        );
        expect(getAllByTestId('criteria')[0]).toHaveAttribute('data-valid', 'true');
        expect(getAllByTestId('criteria')[1]).toHaveAttribute('data-valid', 'false');
    });

    test('renders successful when alphanumeric is validated', async () => {
        const {debug, getAllByTestId} = render(
            <PasswordCriteria criteria={criteria} password="abcdABCD1234" />
        );
        expect(getAllByTestId('criteria')[0]).toHaveAttribute('data-valid', 'true');
        expect(getAllByTestId('criteria')[1]).toHaveAttribute('data-valid', 'true');
    });
});
