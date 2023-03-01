import React, {useContext} from 'react';
import {act, render} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Toast from '../../components/Toast';
import ToastContext from '../../components/Toast/context';
import ToastProvider from '../../components/Toast/provider';

describe('Component: Toast', () => {
    test('renders as expected', async () => {
        const {asFragment} = render(<Toast queue={[]} />);
        expect(asFragment()).toMatchSnapshot();
    });

    test('renders toast items as expected', async () => {
        const {getByText} = render(
            <ToastProvider>
                <Toast queue={[{type: 'success', text: 'Success!'}]} />
            </ToastProvider>
        );

        expect(getByText('Success!')).toBeInTheDocument();
    });

    test('renders an item once it has been added', async () => {
        const {getByText} = render(
            <ToastProvider>
                <ToastContext.Consumer>
                    {({addToast, toastQueue}) => (
                        <>
                            <Toast queue={toastQueue} />
                            <button
                                type="button"
                                onClick={() => addToast({type: 'success', text: 'Success!'})}
                            >
                                Add
                            </button>
                        </>
                    )}
                </ToastContext.Consumer>
            </ToastProvider>
        );

        getByText('Add').click();
        expect(getByText('Success!')).toBeInTheDocument();
    });

    test('removes an item once it has been rendered', async () => {
        jest.useFakeTimers();

        const {queryByText, getByText} = render(
            <ToastProvider>
                <ToastContext.Consumer>
                    {({addToast, toastQueue}) => (
                        <>
                            <Toast queue={toastQueue} />
                            <button
                                type="button"
                                onClick={() => addToast({type: 'success', text: 'Success!'})}
                            >
                                Add
                            </button>
                        </>
                    )}
                </ToastContext.Consumer>
            </ToastProvider>
        );

        getByText('Add').click();
        expect(getByText('Success!')).toBeInTheDocument();
        act(() => jest.advanceTimersByTime(4000));
        expect(queryByText('Success!')).not.toBeInTheDocument();
    });

    test('renders only the first item in an queue', async () => {
        const {getByText} = render(
            <ToastProvider>
                <ToastContext.Consumer>
                    {({addToast, toastQueue}) => (
                        <>
                            <Toast queue={toastQueue} />
                            <button
                                type="button"
                                onClick={() => {
                                    addToast({type: 'success', text: 'Success!'});
                                    addToast({type: 'success', text: 'Success 2!'});
                                }}
                            >
                                Add
                            </button>
                        </>
                    )}
                </ToastContext.Consumer>
            </ToastProvider>
        );

        getByText('Add').click();
        expect(getByText('Success!')).toBeInTheDocument();
    });

    test('renders each item in the queue ', async () => {
        jest.useFakeTimers();

        const {getByText} = render(
            <ToastProvider>
                <ToastContext.Consumer>
                    {({addToast, toastQueue}) => (
                        <>
                            <Toast queue={toastQueue} />
                            <button
                                type="button"
                                onClick={() => {
                                    addToast({type: 'success', text: 'Success!'});
                                    addToast({type: 'success', text: 'Success 2!'});
                                }}
                            >
                                Add
                            </button>
                        </>
                    )}
                </ToastContext.Consumer>
            </ToastProvider>
        );

        getByText('Add').click();
        expect(getByText('Success!')).toBeInTheDocument();
        act(() => jest.advanceTimersByTime(4000));
        expect(getByText('Success 2!')).toBeInTheDocument();
    });
});
