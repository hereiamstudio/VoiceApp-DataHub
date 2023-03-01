import React from 'react';
import {RecoilRoot} from 'recoil';
import * as NextAuth from 'next-auth/react';
import {render, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import mockSessionAdministrator from '../../cypress/fixtures/session-administrator.json';
import IdleTimeout from '../../components/IdleTimeout';
import ModalProvider from '../../components/Modal/provider';

jest.mock('next-auth/react', () => ({
    ...jest.requireActual('next-auth/react'),
    signOut: jest.fn()
}));

describe('Component: IdleTimeout', () => {
    beforeEach(() => {
        fetchMock.mockResponse(
            JSON.stringify({
                csrfToken: '3647deb622b5b75e758f8ca1170002afe1e4d43a128bc5d4c6165f54e58299cb'
            })
        );
    });
    afterEach(() => {
        fetchMock.resetMocks();
    });

    test('does not render by default', () => {
        const {container} = render(
            <NextAuth.SessionProvider session={mockSessionAdministrator}>
                <RecoilRoot>
                    <IdleTimeout />
                </RecoilRoot>
            </NextAuth.SessionProvider>
        );

        expect(container.firstChild).toBeNull();
    });

    test('renders a confirmation modal after idle timeout has passed', async () => {
        const {getByTestId} = render(
            <NextAuth.SessionProvider session={mockSessionAdministrator}>
                <RecoilRoot>
                    <ModalProvider>
                        <IdleTimeout warningTimeout={20} />
                    </ModalProvider>
                </RecoilRoot>
            </NextAuth.SessionProvider>,
            {
                wrapper: ({children}) => (
                    <div>
                        <div id="portals" />
                        {children}
                    </div>
                )
            }
        );
        const $modal = await waitFor(() => getByTestId('timeout-modal'));

        expect($modal).toBeInTheDocument();
    });

    test('allows user to continue their session after being shown the modal', async () => {
        const {getByTestId, debug, queryByTestId} = render(
            <NextAuth.SessionProvider session={mockSessionAdministrator}>
                <RecoilRoot>
                    <ModalProvider>
                        <IdleTimeout warningTimeout={20} />
                    </ModalProvider>
                </RecoilRoot>
            </NextAuth.SessionProvider>,
            {
                wrapper: ({children}) => (
                    <div>
                        <div id="portals" />
                        {children}
                    </div>
                )
            }
        );

        await waitFor(() => getByTestId('timeout-modal'));
        queryByTestId('modal-confirm').click();
        await waitFor(() => expect(queryByTestId('timeout-modal')).not.toBeInTheDocument());
    });

    test('logs a user out if they did not choose to continue', async () => {
        const {getByTestId, debug, queryByTestId} = render(
            <NextAuth.SessionProvider session={mockSessionAdministrator}>
                <RecoilRoot>
                    <ModalProvider>
                        <IdleTimeout logoutTimeout={20} warningTimeout={20} />
                    </ModalProvider>
                </RecoilRoot>
            </NextAuth.SessionProvider>,
            {
                wrapper: ({children}) => (
                    <div>
                        <div id="portals" />
                        {children}
                    </div>
                )
            }
        );

        await waitFor(() => getByTestId('timeout-modal'));
        await waitFor(() => expect(NextAuth.signOut).toHaveBeenCalled());
    });
});
