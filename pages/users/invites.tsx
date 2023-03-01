import React, {useContext, useState} from 'react';
import useSWR from 'swr';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import APIView from '@/components/APIView';
import DataList from '@/components/DataList';
import ModalContext from '@/components/Modal/context';
import PageHeader from '@/components/PageHeader';
import Pagination from '@/components/Pagination';
import usePagination from '@/components/Pagination/usePagination';
import PageWrapper from '@/components/PageWrapper';
import RoleRestriction from '@/components/RoleRestriction';
import SEO from '@/components/SEO';
import Toast from '@/components/Toast';
import ToastContext from '@/components/Toast/context';
import strings from '@/locales/en.json';
import {COUNTRIES} from '@/utils/countries';
import fetch from '@/utils/fetch';
import {ROLES, ROLES_THEMES} from '@/utils/roles';

dayjs.extend(relativeTime);

const UsersInvitesIndexPage: React.FC = () => {
    const {addToast} = useContext(ToastContext);
    const [revokedIds, setRevokedIds] = useState<string[]>([]);
    const {
        currentPage,
        handlePageNext,
        handlePagePrevious,
        itemsOffset,
        itemsPerPage,
        resetPagination
    } = usePagination({itemsPerPage: 20});
    const {
        data: allInvites,
        error,
        mutate
    } = useSWR(`/api/invites?limit=${itemsPerPage}&offset=${itemsOffset}&revoked=${revokedIds}`);

    const handleInviteResend = async id => {
        try {
            await fetch(`/api/invites/${id}/resend-invitation`);

            addToast({
                title: strings.invitesList.resendInvitationSuccess.title,
                text: strings.invitesList.resendInvitationSuccess.text,
                type: 'success'
            });
        } catch (error) {
            addToast({
                title: strings.generic.formSubmissionError,
                text: strings.generic.apiError,
                type: 'error'
            });
        }
    };

    const handleInviteRevoke = async id => {
        try {
            const response = await fetch(`/api/invites/${id}/revoke`);
            setRevokedIds(prevRevokedIds => [...prevRevokedIds, id]);

            addToast({
                title: strings.invitesList.revokeSuccess.title,
                text: strings.invitesList.revokeSuccess.text,
                type: 'success'
            });
        } catch (error) {
            addToast({
                title: strings.generic.formSubmissionError,
                text: strings.generic.apiError,
                type: 'error'
            });
        }
    };

    return (
        <PageWrapper>
            <RoleRestriction action="invites:list" redirect="/">
                <SEO title={strings.invitesList.title} />
                <PageHeader
                    breadcrumbNav={[
                        {label: 'All users', url: '/users'},
                        {label: 'All pending invites'}
                    ]}
                    secondaryCta={{
                        icon: 'chevron-left',
                        iconPosition: 'left',
                        label: strings.invitesList.back,
                        url: '/users'
                    }}
                    title={strings.invitesList.title}
                />

                <APIView
                    empty={strings.invitesList.empty}
                    error={error}
                    hasError={error}
                    isEmpty={allInvites && !allInvites?.length}
                    isLoading={!error && !allInvites}
                >
                    {allInvites?.length &&
                        allInvites.map((invite, index) => (
                            <DataList
                                key={invite.id}
                                actions={[
                                    {
                                        icon: 'refresh',
                                        label: strings.invitesList.resend,
                                        onClick: () => handleInviteResend(invite.id)
                                    },
                                    {
                                        icon: 'cross',
                                        label: strings.invitesList.revoke,
                                        onClick: () => handleInviteRevoke(invite.id)
                                    }
                                ]}
                                badges={[
                                    {
                                        theme: ROLES_THEMES[invite.data.role],
                                        title: ROLES[invite.data.role]
                                    }
                                ]}
                                subtitle={`${COUNTRIES[invite.data.country]} &middot; ${
                                    invite.data.company_name
                                } &middot; Invited ${dayjs(invite.data.created_at).from(
                                    new Date()
                                )} by ${invite.data.invited_by}`}
                                title={`${invite.data.first_name} ${invite.data.last_name}`}
                            />
                        ))}
                </APIView>
                {(allInvites?.length >= itemsPerPage || currentPage > 1) && (
                    <>
                        <div className="mt-2" />
                        <Pagination
                            page={currentPage}
                            handleNext={handlePageNext}
                            handlePrevious={handlePagePrevious}
                            showNext={allInvites?.length >= itemsPerPage}
                        />
                    </>
                )}
            </RoleRestriction>
        </PageWrapper>
    );
};

export default UsersInvitesIndexPage;
