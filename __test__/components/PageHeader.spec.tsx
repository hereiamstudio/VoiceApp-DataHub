import React from 'react';
import {act, render, waitFor, within} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import PageHeader from '../../components/PageHeader';

describe('Component: PageHeader', () => {
    test('renders a title', async () => {
        const title = 'Foo bar baz';
        const {getByText} = render(<PageHeader title={title} />);

        expect(getByText(title)).toBeInTheDocument();
    });

    test('renders a primary cta', async () => {
        const title = 'Foo bar baz';
        const primaryCta = {
            url: '/',
            label: 'Foo'
        };
        const {getByText} = render(<PageHeader primaryCta={primaryCta} title={title} />);

        expect(getByText(primaryCta.label)).toBeInTheDocument();
    });

    test('renders a custom primary cta component', async () => {
        const title = 'Foo bar baz';
        const {getByTestId} = render(
            <PageHeader
                CustomPrimaryCta={() => <span data-testid="custom-primary-cta">Foo</span>}
                title={title}
            />
        );

        expect(getByTestId('custom-primary-cta')).toBeInTheDocument();
    });

    test('renders a secondary cta', async () => {
        const title = 'Foo bar baz';
        const secondaryCta = {
            url: '/',
            label: 'Bar'
        };
        const {getByText} = render(<PageHeader secondaryCta={secondaryCta} title={title} />);

        expect(getByText(secondaryCta.label)).toBeInTheDocument();
    });

    test('renders a breadcrumb nav', async () => {
        const title = 'Foo bar baz';
        const breadcrumbNav = [
            {
                url: '/',
                label: 'Foo'
            },
            {
                url: '/foo',
                label: 'Bar'
            }
        ];
        const {getByText, getByTestId} = render(
            <PageHeader breadcrumbNav={breadcrumbNav} title={title} />
        );

        const allLinks = getByTestId('breadcrumb-nav-links');

        act(() => {
            expect(within(allLinks).getByText(breadcrumbNav[0].label)).toBeInTheDocument();
            expect(within(allLinks).getByText(breadcrumbNav[1].label)).toBeInTheDocument();
        });
    });

    test('renders a back button for mobile', async () => {
        const title = 'Foo bar baz';
        const breadcrumbNav = [
            {
                url: '/',
                label: 'Foo'
            },
            {
                url: '/foo',
                label: 'Bar'
            },
            {
                label: 'Baz'
            }
        ];
        const {getByText, getByTestId} = render(
            <PageHeader breadcrumbNav={breadcrumbNav} title={title} />
        );

        act(() => {
            const backLink = getByTestId('breadcrumb-nav-back');

            expect(within(backLink).getByText(breadcrumbNav[1].label)).toBeInTheDocument();
        });
    });
});
