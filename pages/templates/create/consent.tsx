import React, {useContext, useState} from 'react';
import {useRouter} from 'next/router';
import Form from '@/components/Form';
import FormSection from '@/components/FormSection';
import PageHeader from '@/components/PageHeader';
import PageWrapper from '@/components/PageWrapper';
import SEO from '@/components/SEO';
import ToastContext from '@/components/Toast/context';
import strings from '@/locales/en.json';
import {consentSchema} from '@/schemas/template';
import {RequestType} from '@/types/request';
import fetch, {fetchOptions} from '@/utils/fetch';
import {INTERVIEW_LANGUAGES} from '@/utils/interviews';

const TemplateConsentCreatePage: React.FC = () => {
    const router = useRouter();
    const [formStatus, setFormStatus] = useState({feedback: '', status: RequestType.DEFAULT});
    const {addToast} = useContext(ToastContext);

    const handleFormSubmit = async values => {
        setFormStatus({feedback: '', status: RequestType.PENDING});

        values.confirmation_options = values.confirmation_options.map(option => ({
            label: option
        }));

        try {
            await fetch(
                `/api/templates/create`,
                fetchOptions({body: {...values, type: 'consent'}, method: 'post'})
            );

            addToast({
                title: strings.templatesSections.createDocument.success.title,
                text: strings.templatesSections.createDocument.success.text,
                type: 'success'
            });
            setFormStatus({feedback: '', status: RequestType.DEFAULT});
            router.push('/templates');
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
            <SEO title={strings.templatesSections.consent.create.title} />
            <PageHeader
                breadcrumbNav={[{label: 'All templates', url: '/templates'}, {label: 'Create'}]}
                secondaryCta={{
                    label: 'Back',
                    icon: 'chevron-left',
                    iconPosition: 'left',
                    url: '/templates'
                }}
                title={strings.templatesSections.consent.create.title}
            />

            <Form.Container
                {...consentSchema}
                handleSubmit={handleFormSubmit}
                name="template-consent-create-form"
                options={{
                    primary_language: () => {
                        return Object.keys(INTERVIEW_LANGUAGES).map(languageKey => ({
                            label: INTERVIEW_LANGUAGES[languageKey],
                            value: languageKey
                        }));
                    }
                }}
                status={formStatus.status}
            >
                <FormSection
                    error={formStatus.status === RequestType.ERROR ? formStatus.feedback : null}
                    name="templatesFields"
                    status={formStatus.status}
                    submitLabel={strings.interviewsUpdate.consent_step_1.submit}
                    text={strings.interviewsUpdate.consent_step_1.text}
                    title={strings.interviewsUpdate.consent_step_1._title}
                >
                    <Form.Fields />
                    <Form.Errors />
                </FormSection>
            </Form.Container>
        </PageWrapper>
    );
};

export default TemplateConsentCreatePage;
