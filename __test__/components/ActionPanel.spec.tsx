import React from 'react';
import {render} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ActionPanel from '@/components/ActionPanel';

describe('Component: ActionPanel', () => {
    test('renders a title', async () => {
        const title =
            'Nostrud ut esse eu eiusmod dolor consectetur Lorem fugiat consequat est voluptate dolor nulla.';
        const text = 'Culpa eu dolor ex tempor et et laborum.';
        const cta = {
            url: '/',
            label: 'Foo'
        };
        const {getByText} = render(<ActionPanel title={title} text={text} cta={cta} />);

        expect(getByText(title)).toBeInTheDocument();
    });

    test('renders a message', async () => {
        const title =
            'Nostrud ut esse eu eiusmod dolor consectetur Lorem fugiat consequat est voluptate dolor nulla.';
        const text = 'Culpa eu dolor ex tempor et et laborum.';
        const cta = {
            url: '/',
            label: 'Foo'
        };
        const {getByText} = render(<ActionPanel title={title} text={text} cta={cta} />);

        expect(getByText(text)).toBeInTheDocument();
    });

    test('renders a cta', async () => {
        const title =
            'Nostrud ut esse eu eiusmod dolor consectetur Lorem fugiat consequat est voluptate dolor nulla.';
        const text = 'Culpa eu dolor ex tempor et et laborum.';
        const cta = {
            url: '/',
            label: 'Foo'
        };
        const {getByText} = render(<ActionPanel title={title} text={text} cta={cta} />);

        expect(getByText(cta.label)).toBeInTheDocument();
    });
});
