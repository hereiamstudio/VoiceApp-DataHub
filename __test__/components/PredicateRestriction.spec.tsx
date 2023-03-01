import React from 'react';
import {render, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import PredicateRestriction from '../../components/PredicateRestriction';

describe('Component: PredicateRestriction', () => {
    test('renders nothing by default', async () => {
        const allowedText = 'Allowed';
        const {queryByText} = render(
            <PredicateRestriction predicate="" data={null}>
                <span>{allowedText}</span>
            </PredicateRestriction>
        );

        await waitFor(() => {
            expect(queryByText(allowedText)).not.toBeInTheDocument();
        });
    });

    test('renders nothing if the predicate fails for "maido internal" check', async () => {
        const allowedText = 'Allowed';
        const {queryByText} = render(
            <PredicateRestriction predicate="isInternal" data="test@gmail.com">
                <span>{allowedText}</span>
            </PredicateRestriction>
        );

        await waitFor(() => {
            expect(queryByText(allowedText)).not.toBeInTheDocument();
        });
    });

    test('renders children if the predicate passes for "maido internal" check', async () => {
        const allowedText = 'Allowed';
        const {queryByText} = render(
            <PredicateRestriction predicate="isInternal" data="test@maido.com">
                <span>{allowedText}</span>
            </PredicateRestriction>
        );

        await waitFor(() => {
            expect(queryByText(allowedText)).toBeInTheDocument();
        });
    });
});
