import React from 'react';
import {RecoilRoot} from 'recoil';
import {render, waitFor} from '@testing-library/react';
import {SessionProvider} from 'next-auth/react';
import '@testing-library/jest-dom/extend-expect';
import mockSessionAdministrator from '../../cypress/fixtures/session-administrator.json';
import mockSessionAssessmentLead from '../../cypress/fixtures/session-assessment_lead.json';
import RoleRestriction from '../../components/RoleRestriction';

describe('Component: RoleRestriction', () => {
    test('renders nothing by default', async () => {
        const allowedText = 'Allowed';
        const {queryByText} = render(
            <SessionProvider session={{}}>
                <RecoilRoot>
                    <RoleRestriction action="">
                        <span>{allowedText}</span>
                    </RoleRestriction>
                </RecoilRoot>
            </SessionProvider>
        );

        await waitFor(() => {
            expect(queryByText(allowedText)).not.toBeInTheDocument();
        });
    });

    test('renders a component if the user role is allowed to perform the action', async () => {
        const allowedText = 'Allowed';
        const {queryByText} = render(
            <SessionProvider session={mockSessionAdministrator}>
                <RecoilRoot>
                    <RoleRestriction action="users:list">
                        <span>{allowedText}</span>
                    </RoleRestriction>
                </RecoilRoot>
            </SessionProvider>
        );

        expect(queryByText(allowedText)).toBeInTheDocument();
    });

    test('renders nothing if the user role is not allowed to perform the action but there is no fallback', async () => {
        const restrictedText = 'Restricted';
        const {container, queryByText} = render(
            <SessionProvider session={mockSessionAssessmentLead}>
                <RecoilRoot>
                    <RoleRestriction action="users:list">
                        <span>{restrictedText}</span>
                    </RoleRestriction>
                </RecoilRoot>
            </SessionProvider>
        );

        await waitFor(() => {
            expect(queryByText(restrictedText)).not.toBeInTheDocument();
        });
    });
});
