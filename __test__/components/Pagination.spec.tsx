import React from 'react';
import {fireEvent, render, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Pagination from '../../components/Pagination';

describe('Component: Pagination', () => {
    test('renders the current page', async () => {
        const handleNext = jest.fn();
        const handlePrevious = jest.fn();
        const {getByText} = render(
            <Pagination
                handleNext={handleNext}
                handlePrevious={handlePrevious}
                page={5}
                showNext={true}
            />
        );

        expect(getByText('Page 5', {exact: false})).toBeInTheDocument();
    });

    test('disables clicks on Prev page if page is 1', async () => {
        const handleNext = jest.fn();
        const handlePrevious = jest.fn();
        const {debug, getByText} = render(
            <Pagination
                handleNext={handleNext}
                handlePrevious={handlePrevious}
                page={1}
                showNext={true}
            />
        );

        fireEvent.click(getByText('Previous'), 'rightClick');
        expect(handleNext.mock.calls.length).toEqual(0);
    });

    test('handles clicks on Prev page', async () => {
        const handleNext = jest.fn();
        const handlePrevious = jest.fn();
        const {getByText} = render(
            <Pagination
                handleNext={handleNext}
                handlePrevious={handlePrevious}
                page={5}
                showNext={true}
            />
        );

        fireEvent.click(getByText('Previous'), 'rightClick');
        expect(handlePrevious).toHaveBeenCalled();
    });

    test('disables clicks on Next page if page `showNext` is false', async () => {
        const handleNext = jest.fn();
        const handlePrevious = jest.fn();
        const {debug, getByText} = render(
            <Pagination
                handleNext={handleNext}
                handlePrevious={handlePrevious}
                page={1}
                showNext={false}
            />
        );

        fireEvent.click(getByText('Next'), 'rightClick');
        expect(handleNext.mock.calls.length).toEqual(0);
    });

    test('handles clicks on Next page', async () => {
        const handleNext = jest.fn();
        const handlePrevious = jest.fn();
        const {getByText} = render(
            <Pagination
                handleNext={handleNext}
                handlePrevious={handlePrevious}
                page={5}
                showNext={true}
            />
        );

        fireEvent.click(getByText('Next'), 'rightClick');
        expect(handleNext).toHaveBeenCalled();
    });
});
