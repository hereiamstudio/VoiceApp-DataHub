import React from 'react';
import {render} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Icon from '../../components/Icon';

describe('Component: Icon', () => {
    const icons = [
        'archive',
        'badge-check',
        'chart',
        'check',
        'check-circle',
        'chevron-left',
        'chevron-right',
        'clock',
        'collection',
        'cross',
        'document-download',
        'error',
        'folder',
        'handle',
        'home',
        'info',
        'logout',
        'pencil',
        'plus',
        'refresh',
        'switch-vertical',
        'template',
        'users'
    ];

    icons.map(icon => {
        test(`renders a "${icon}" icon`, async () => {
            const {container} = render(<Icon name={icon} />);

            expect(container.querySelector('svg')).toBeInTheDocument();
        });

        test(`renders custom classes for "${icon}" icon`, async () => {
            const {container} = render(<Icon classes="foo" name={icon} />);

            expect(container.querySelector('svg').getAttribute('class').includes('foo')).toEqual(
                true
            );
        });
    });
});
