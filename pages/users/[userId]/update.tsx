import React, {useContext, useState} from 'react';
import {useRouter} from 'next/router';
import useSWR from 'swr';
import pick from 'lodash/pick';
import ArchiveDocument from '@/components/ArchiveDocument';
import Button from '@/components/Button';
import Divider from '@/components/Divider';
import Form from '@/components/Form';
import FormSection from '@/components/FormSection';
import PageHeader from '@/components/PageHeader';
import PageWrapper from '@/components/PageWrapper';
import PasswordCriteria from '@/components/PasswordCriteria';
import RoleRestriction from '@/components/RoleRestriction';
import SEO from '@/components/SEO';
import ToastContext from '@/components/Toast/context';
import UserProjectsList from '@/components/UserProjectsList';
import strings from '@/locales/en.json';
import {roleSchema, passwordSchema, profileSchema} from '@/schemas/user';
import {RequestType} from '@/types/request';
import fetch, {fetchOptions} from '@/utils/fetch';
import {COUNTRIES} from '@/utils/countries';
import {ROLES} from '@/utils/roles';

const AccountUpdatePage: React.FC = () => {
    const router = useRouter();
    const {userId} = router.query;
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [formStatus, setFormStatus] = useState({feedback: '', status: RequestType.DEFAULT});
    const {addToast} = useContext(ToastContext);
    const {data: user, mutate: mutateUser} = useSWR(() => (userId ? `/api/users/${userId}` : null));

    const handleArchiveUpdate = async is_archived => {
        const updatedUser = user;
        updatedUser.data.is_archived = is_archived;

        await mutateUser(updatedUser);
    };

    const handleFormSubmit = async (values: Object) => {
        setFormStatus({feedback: '', status: RequestType.PENDING});

        try {
            await fetch(`/api/users/${userId}/update`, fetchOptions({body: values, method: 'put'}));
            await mutateUser(`/api/users/${userId}`);

            addToast({
                title: strings.usersUpdate.profile.updateSuccess.title,
                text: strings.usersUpdate.profile.updateSuccess.text,
                type: 'success'
            });
            setFormStatus({feedback: '', status: RequestType.DEFAULT});
        } catch (error) {
            addToast({
                title: strings.generic.formSubmissionError,
                text: error?.data?.message || error.message,
                type: 'error'
            });
            setFormStatus({feedback: '', status: RequestType.DEFAULT});
        }
    };

    return (
        <PageWrapper>
            <SEO title={strings.usersUpdate.title} />
            <PageHeader
                breadcrumbNav={[{label: 'All users', url: '/users'}, {label: 'Update'}]}
                secondaryCta={{
                    label: 'Back',
                    icon: 'chevron-left',
                    iconPosition: 'left',
                    url: '/users'
                }}
                title={strings.usersUpdate.title}
            />
            <Form.Container
                {...profileSchema}
                handleSubmit={handleFormSubmit}
                initialValues={pick(user?.data, Object.keys(profileSchema.fields))}
                name="user-update-form"
                options={{
                    country: () => {
                        return Object.keys(COUNTRIES).map(key => ({
                            label: COUNTRIES[key],
                            value: key
                        }));
                    }
                }}
                status={formStatus.status}
            >
                <FormSection
                    error={formStatus.status === RequestType.ERROR ? formStatus.feedback : null}
                    name="userUpdate.profile"
                    status={formStatus.status}
                    submitLabel={strings.usersUpdate.profile.submit}
                    text={strings.usersUpdate.profile.text}
                    title={strings.usersUpdate.profile.title}
                >
                    <Form.Fields />
                    <Form.Errors />
                </FormSection>
            </Form.Container>
            <Divider hideAtMobile={true} />
            <Form.Container
                {...roleSchema}
                components={{
                    RoleInfo: ({values}) => {
                        return values.role ? (
                            <div className="col-span-6 sm:col-span-3 sm:pt-6">
                                <strong className="text-sm font-medium text-gray-800">
                                    {strings.roles[values.role].text}
                                </strong>
                                <ul className="list-inside list-disc text-sm text-gray-600">
                                    {strings.roles[values.role].actions.map(action => (
                                        <li key={action}>{action}</li>
                                    ))}
                                </ul>
                            </div>
                        ) : null;
                    }
                }}
                handleSubmit={handleFormSubmit}
                initialValues={pick(user?.data, Object.keys(roleSchema.fields))}
                name="user-update-role-form"
                options={{
                    role: () => {
                        return Object.keys(ROLES).map(key => ({
                            label: ROLES[key],
                            value: key
                        }));
                    }
                }}
                status={formStatus.status}
            >
                <FormSection
                    name="userUpdate.role"
                    status={formStatus.status}
                    submitLabel={strings.usersUpdate.role.submit}
                    text={strings.usersUpdate.role.text}
                    title={strings.usersUpdate.role.title}
                >
                    <Form.Fields />
                    <Form.Errors />
                </FormSection>
            </Form.Container>{' '}
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
                        error={formStatus.status === RequestType.ERROR ? formStatus.feedback : null}
                        name="usersUpdate.password"
                        status={formStatus.status}
                        text={strings.usersUpdate.password.text}
                        title={strings.usersUpdate.password.title}
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
            {user?.id && (
                <>
                    <RoleRestriction action="users:projectList">
                        <Divider hideAtMobile={true} />
                        <FormSection
                            showForm={false}
                            text={strings.usersUpdate.projectsList.text}
                            title={strings.usersUpdate.projectsList.title}
                        >
                            <UserProjectsList id={user.id} />
                        </FormSection>
                    </RoleRestriction>
                    <RoleRestriction action="activities:list">
                        <Divider hideAtMobile={true} />
                        <FormSection
                            showForm={false}
                            text={strings.usersUpdate.activitiesList.text}
                            title={strings.usersUpdate.activitiesList.title}
                        >
                            <div className="flex sm:justify-end">
                                <Button url={`/activities?user=${user.id}`}>View activity</Button>
                            </div>
                        </FormSection>
                    </RoleRestriction>
                    <RoleRestriction action="users:archive">
                        <Divider hideAtMobile={true} />
                        <ArchiveDocument
                            collection="users"
                            handleUpdate={handleArchiveUpdate}
                            id={userId?.toString()}
                            isArchived={user?.data?.is_archived}
                        />
                    </RoleRestriction>
                </>
            )}
        </PageWrapper>
    );
};

export default AccountUpdatePage;
