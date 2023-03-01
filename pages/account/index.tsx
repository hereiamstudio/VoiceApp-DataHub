import React, {useContext, useState} from 'react';
import useSWR from 'swr';
import {signOut, useSession} from 'next-auth/react';
import omit from 'lodash/omit';
import AlertModal from '@/components/AlertModal';
import Button from '@/components/Button';
import Divider from '@/components/Divider';
import Form from '@/components/Form';
import FormSection from '@/components/FormSection';
import ModalContext from '@/components/Modal/context';
import PageHeader from '@/components/PageHeader';
import PageWrapper from '@/components/PageWrapper';
import PasswordCriteria from '@/components/PasswordCriteria';
import SEO from '@/components/SEO';
import ToastContext from '@/components/Toast/context';
import strings from '@/locales/en.json';
import {profileSchema, passwordSchema} from '@/schemas/accountUpdate';
import {ModalVisibility} from '@/types/index';
import fetch, {fetchOptions} from '@/utils/fetch';
import {COUNTRIES} from '@/utils/countries';
import {ROLES} from '@/utils/roles';
import {RequestType} from '@/types/request';
import type {User} from '@/types/user';

const AccountIndexPage: React.FC = () => {
    const {data: session} = useSession();
    const [showPasswordForm, setShowPasswordForm] = useState<boolean>(false);
    const [logoutStatus, setLogoutStatus] = useState<RequestType>(RequestType.DEFAULT);
    const [formStatus, setFormStatus] = useState({feedback: '', status: RequestType.DEFAULT});
    const {hideModal, modalContext, modalKey, showModal, visibility} = useContext(ModalContext);
    const {addToast} = useContext(ToastContext);
    const {data: account, mutate: mutateUser} = useSWR(() =>
        session?.user ? `/api/users/${session.user.uid}` : null
    );

    const submitForm = async (values: Partial<User>, requiresLogout: boolean = false) => {
        setFormStatus({feedback: '', status: RequestType.PENDING});

        try {
            const response = await fetch(
                `/api/account/${session.user.uid}/update`,
                fetchOptions({body: values, method: 'put'})
            );

            addToast({
                title: strings.account.profile.updateSuccess.title,
                text: strings.account.profile.updateSuccess.text,
                type: 'success'
            });
            setFormStatus({feedback: '', status: RequestType.DEFAULT});

            if (requiresLogout) {
                await signOut();
            } else {
                await fetch('/api/auth/session?update=auth', {
                    method: 'GET',
                    credentials: 'include'
                });
                await mutateUser(response);
            }
        } catch (error) {
            addToast({
                title: strings.generic.formSubmissionError,
                text: error?.data?.message || error.message,
                type: 'error'
            });
            setFormStatus({feedback: '', status: RequestType.DEFAULT});
        }
    };

    const handleFormSubmit = async (values: Partial<User>) => {
        const willLoginInfoChange = account.data.email !== values.email || values.password;

        // If anything to do with the user's login details change we need the
        // user to log in again because Firebase will revoke the current token.
        if (willLoginInfoChange) {
            showModal('confirmProfileChange', values);
        } else {
            await submitForm(values);
        }
    };

    const handleLogout = async () => {
        setLogoutStatus(RequestType.PENDING);

        try {
            await signOut();
        } catch (e) {
            setLogoutStatus(RequestType.DEFAULT);
            console.error(e);
        }
    };

    return (
        <PageWrapper>
            <SEO title={strings.account.title} />
            <PageHeader title={strings.account.title} />

            <Form.Container
                {...profileSchema}
                handleSubmit={handleFormSubmit}
                initialValues={omit(account?.data, ['email_verified', 'uid'])}
                name="user-update-role-form"
                options={{
                    country: () => {
                        return Object.keys(COUNTRIES).map(key => ({
                            label: COUNTRIES[key],
                            value: key
                        }));
                    }
                }}
                status={account?.data ? formStatus.status : RequestType.PENDING}
            >
                <FormSection
                    name="userUpdate.role"
                    status={formStatus.status}
                    text={strings.account.role.text}
                    title={strings.account.role.title}
                >
                    <Form.Fields />
                    <Form.Errors />
                </FormSection>
            </Form.Container>

            <Divider hideAtMobile={true} />

            {showPasswordForm ? (
                <Form.Container
                    {...passwordSchema}
                    components={{
                        PasswordCriteria: ({values}) => (
                            <div className="-mt-2 sm:mt-6">
                                <PasswordCriteria
                                    criteria={strings.passwordCriteria}
                                    password={values.password}
                                />
                            </div>
                        )
                    }}
                    handleSubmit={handleFormSubmit}
                    name="user-update-password-form"
                    status={formStatus.status}
                >
                    <FormSection
                        name="userUpdate.password"
                        status={formStatus.status}
                        text={strings.account.password.text}
                        title={strings.account.password.title}
                    >
                        <Form.Fields />
                        <Form.Errors />
                    </FormSection>
                </Form.Container>
            ) : (
                <FormSection
                    name="userUpdate.password"
                    showForm={false}
                    status={formStatus.status}
                    text={strings.account.password.text}
                    title={strings.account.password.title}
                >
                    <div className="bg-white px-4 py-5 shadow sm:overflow-hidden sm:rounded-md sm:p-6">
                        <Button onClick={() => setShowPasswordForm(true)} theme="secondary">
                            {strings.account.password.toggle}
                        </Button>
                    </div>
                </FormSection>
            )}

            <Divider hideAtMobile={true} />

            {account?.data?.role && (
                <div className="animate-fade-in">
                    <FormSection
                        showForm={false}
                        text={strings.account.role.text}
                        title={strings.account.role.title}
                    >
                        <div className="shadow sm:overflow-hidden sm:rounded-md">
                            <div className="bg-white px-4 py-5 sm:p-6">
                                <div className="grid grid-cols-6 gap-6">
                                    <div className="col-span-6 text-sm sm:col-span-3">
                                        {strings.account.role.activeRole}{' '}
                                        <strong className="font-medium">
                                            {ROLES[account.data.role]}
                                        </strong>
                                    </div>
                                    <div className="col-span-6 sm:col-span-3">
                                        <strong className="text-sm font-medium text-gray-800">
                                            {strings.roles[account.data.role].text}
                                        </strong>
                                        <ul className="list-inside list-disc text-sm text-gray-600">
                                            {strings.roles[account.data.role].actions.map(
                                                action => (
                                                    <li key={action}>{action}</li>
                                                )
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </FormSection>
                </div>
            )}

            <Divider hideAtMobile={true} />

            <FormSection
                showForm={false}
                text={strings.account.logout.text}
                title={strings.account.logout.title}
            >
                <div className="sm:text-right">
                    <Button onClick={handleLogout} theme="destructive" state={logoutStatus}>
                        {strings.account.logout.cta}
                    </Button>
                </div>
            </FormSection>

            <AlertModal
                cancelCta={{
                    label: strings.account.confirm.cancel,
                    onClick: () => hideModal()
                }}
                confirmCta={{
                    label: strings.account.confirm.submit,
                    onClick: () => submitForm(modalContext, true)
                }}
                handleHide={hideModal}
                text={strings.account.confirm.text}
                title={strings.account.confirm.title}
                visibility={
                    modalKey === 'confirmProfileChange' ? visibility : ModalVisibility.HIDDEN
                }
            />
        </PageWrapper>
    );
};

export default AccountIndexPage;
