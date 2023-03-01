import React, {useContext, useState} from 'react';
import {useRouter} from 'next/router';
import Divider from '@/components/Divider';
import Form from '@/components/Form';
import FormSection from '@/components/FormSection';
import PageHeader from '@/components/PageHeader';
import PageWrapper from '@/components/PageWrapper';
import SEO from '@/components/SEO';
import ToastContext from '@/components/Toast/context';
import strings from '@/locales/en.json';
import {createSchema} from '@/schemas/user';
import {RequestType} from '@/types/request';
import fetch, {fetchOptions} from '@/utils/fetch';
import {COUNTRIES} from '@/utils/countries';
import {ROLES} from '@/utils/roles';

const AccountCreatePage = () => {
    const router = useRouter();
    const [formStatus, setFormStatus] = useState({feedback: '', status: RequestType.DEFAULT});
    const {addToast} = useContext(ToastContext);

    const handleFormSubmit = async (values: Object) => {
        setFormStatus({feedback: '', status: RequestType.PENDING});

        try {
            await fetch(`/api/invites/invite`, fetchOptions({body: values, method: 'post'}));

            addToast({
                title: strings.usersCreate.profile.updateSuccess.title,
                text: strings.usersCreate.profile.updateSuccess.text,
                type: 'success'
            });
            setFormStatus({feedback: '', status: RequestType.DEFAULT});
            router.replace('/users');
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
            <SEO title={strings.usersCreate.title} />
            <PageHeader
                breadcrumbNav={[{label: 'All users', url: '/users'}, {label: 'Create'}]}
                secondaryCta={{
                    label: 'Back',
                    icon: 'chevron-left',
                    iconPosition: 'left',
                    url: '/users'
                }}
                title={strings.usersCreate.title}
            />

            <Form.Container
                {...createSchema}
                components={{
                    Divider: () => <div className="-mt-4" />,
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
                name="user-create-form"
                options={{
                    country: () => {
                        return Object.keys(COUNTRIES).map(key => ({
                            label: COUNTRIES[key],
                            value: key
                        }));
                    },
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
                    error={formStatus.status === RequestType.ERROR ? formStatus.feedback : null}
                    name="usersCreate.profile"
                    status={formStatus.status}
                    submitLabel={strings.usersCreate.profile.submit}
                    text={strings.usersCreate.profile.text}
                    title={strings.usersCreate.profile.title}
                >
                    <Form.Fields />
                    <Form.Errors />
                </FormSection>
            </Form.Container>
        </PageWrapper>
    );
};

export default AccountCreatePage;
