import React from 'react';
import {RecoilRoot} from 'recoil';
import {SessionProvider} from 'next-auth/react';
import {render, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Cookies from 'js-cookie';
import AccountVerificationPanel from '../../components/AccountVerificationPanel';
import mockSessionAdministrator from '../../cypress/fixtures/session-administrator.json';
import strings from '../../locales/en.json';
import {sendVerificationEmail} from '../../utils/firebase/user';

describe('Component: AccountVerificationPanel', () => {
    beforeEach(() => {
        fetchMock.mockResponse(JSON.stringify({id: mockSessionAdministrator.user.uid}));
        Cookies.set = jest.fn().mockImplementation(() => mockSessionAdministrator.user.uid);
    });
    afterEach(() => {
        fetchMock.resetMocks();
        Cookies.get = jest.fn().mockImplementation(() => null);
    });

    test('renders a title', async () => {
        const {getByText} = render(
            <SessionProvider session={mockSessionAdministrator}>
                <RecoilRoot>
                    <AccountVerificationPanel />
                </RecoilRoot>
            </SessionProvider>
        );

        await waitFor(() => {
            expect(getByText(strings.account.verify.title)).toBeInTheDocument();
        });
    });

    test('renders a message', async () => {
        const {getByText} = render(
            <SessionProvider session={mockSessionAdministrator}>
                <RecoilRoot>
                    <AccountVerificationPanel />
                </RecoilRoot>
            </SessionProvider>
        );

        await waitFor(() => {
            expect(getByText(strings.account.verify.text)).toBeInTheDocument();
        });
    });

    test('renders a cta if verification not already requested', async () => {
        const {debug, getByText} = render(
            <SessionProvider session={mockSessionAdministrator}>
                <RecoilRoot>
                    <AccountVerificationPanel />
                </RecoilRoot>
            </SessionProvider>
        );

        await waitFor(() => {
            expect(getByText(strings.account.verify.cta)).toBeInTheDocument();
        });
    });

    test('calls request function when verification is required', async () => {
        const {getByText} = render(
            <SessionProvider session={mockSessionAdministrator}>
                <RecoilRoot>
                    <AccountVerificationPanel />
                </RecoilRoot>
            </SessionProvider>
        );

        getByText(strings.account.verify.cta).click();

        await waitFor(() => {
            expect(sendVerificationEmail).toHaveBeenCalledWith(mockSessionAdministrator.user.uid);
        });
    });

    test("renders a 'pending' cta after verification is requested", async () => {
        const {getByText} = render(
            <SessionProvider session={mockSessionAdministrator}>
                <RecoilRoot>
                    <AccountVerificationPanel />
                </RecoilRoot>
            </SessionProvider>
        );

        getByText(strings.account.verify.cta).click();

        await waitFor(
            () => {
                expect(getByText(strings.account.verify.pending)).toBeInTheDocument();
            },
            {timeout: 2000}
        );
    });

    test("renders a 'pending' cta if verification is already requested for the user", async () => {
        Cookies.get = jest.fn().mockImplementation(() => mockSessionAdministrator.user.uid);

        const {queryByText} = render(
            <SessionProvider session={mockSessionAdministrator}>
                <RecoilRoot>
                    <AccountVerificationPanel />
                </RecoilRoot>
            </SessionProvider>
        );

        await waitFor(() => {
            expect(queryByText(strings.account.verify.pending)).toBeInTheDocument();
        });
    });

    test("doesn't render a 'pending' cta if verification is already requested by a different user", async () => {
        Cookies.get = jest.fn().mockImplementation(() => 'abc1234');

        const {queryByText} = render(
            <SessionProvider session={mockSessionAdministrator}>
                <RecoilRoot>
                    <AccountVerificationPanel />
                </RecoilRoot>
            </SessionProvider>
        );

        await waitFor(() => {
            expect(queryByText(strings.account.verify.pending)).not.toBeInTheDocument();
        });
    });
});
