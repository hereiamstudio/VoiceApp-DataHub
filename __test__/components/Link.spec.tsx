import React from 'react';
import {render} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Link from '../../components/Link';

describe('Component: Link', () => {
    test('renders an internal link', async () => {
        const url = '/users';
        const label = 'Foo';
        const {getByText} = render(<Link url={url}>{label}</Link>);

        expect(getByText(label)).toHaveAttribute('href', url);
    });

    test('renders an external link', async () => {
        const label = 'Foo';
        const url = 'https://www.website.com';
        const {getByText} = render(<Link url={url}>{label}</Link>);

        expect(getByText(label)).toHaveAttribute('href', url);
        expect(getByText(label)).toHaveAttribute('target', 'noopener');
    });

    test('renders actions as buttons', async () => {
        const label = 'Foo';
        const handleClick = jest.fn();
        const {container} = render(<Link onClick={handleClick}>{label}</Link>);

        expect(container.querySelector('button')).toBeInTheDocument();
    });

    test('renders additional props', async () => {
        const label = 'Foo';
        const handleClick = jest.fn();
        const {getByText} = render(
            <Link onClick={handleClick} data-foo="bar">
                {label}
            </Link>
        );

        getByText(label).click();
        expect(handleClick.mock.calls.length).toEqual(1);
        expect(getByText(label)).toHaveAttribute('data-foo', 'bar');
    });
});
