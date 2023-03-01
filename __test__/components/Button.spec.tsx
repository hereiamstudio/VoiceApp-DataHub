import React from 'react';
import {render} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Button from '../../components/Button';
import {RequestType} from '@/types/request';

describe('Component: Button', () => {
    test('renders a child component', async () => {
        const label = 'Foo bar baz';
        const {getByText} = render(<Button>{label}</Button>);

        expect(getByText(label)).toBeInTheDocument();
    });

    test('renders an icon', async () => {
        const {container} = render(<Button icon="folder" />);

        expect(container.querySelector('svg')).toBeInTheDocument();
    });

    test('renders a loading state', async () => {
        const label = 'Foo bar baz';
        const {getByTestId} = render(<Button state={RequestType.PENDING}>{label}</Button>);

        expect(getByTestId('activity-indicator')).toBeInTheDocument();
    });
});
