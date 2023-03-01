import React from 'react';
import {render} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Badge from '../../components/Badge';

describe('Component: Badge', () => {
    test('renders child component', async () => {
        const title = 'Foo';
        const {getByText} = render(<Badge>{title}</Badge>);

        expect(getByText(title)).toBeInTheDocument();
    });
});
