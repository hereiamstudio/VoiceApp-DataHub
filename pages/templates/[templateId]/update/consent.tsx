import React, {useContext, useState} from 'react';
import {useRouter} from 'next/router';
import useSWR from 'swr';
import pick from 'lodash/pick';
import ArchiveDocument from '@/components/ArchiveDocument';
import Divider from '@/components/Divider';
import Form from '@/components/Form';
import FormSection from '@/components/FormSection';
import InfoBanner from '@/components/InfoBanner';
import PageHeader from '@/components/PageHeader';
import PageWrapper from '@/components/PageWrapper';
import RoleRestriction from '@/components/RoleRestriction';
import SEO from '@/components/SEO';
import ToastContext from '@/components/Toast/context';
import strings from '@/locales/en.json';
import {consentSchema} from '@/schemas/template';
import {RequestType} from '@/types/request';
import fetch, {fetchOptions} from '@/utils/fetch';
import {INTERVIEW_LANGUAGES} from '@/utils/interviews';

const TemplateQuestionUpdatePage: React.FC = () => {
    const router = useRouter();
    const {templateId} = router.query;
    const [formStatus, setFormStatus] = useState({feedback: '', status: RequestType.DEFAULT});
    const {addToast} = useContext(ToastContext);
    const {data: template, mutate: mutateTemplate} = useSWR(() =>
        templateId ? `/api/templates/${templateId}` : null
    );

    const handleArchiveUpdate = async is_archived => {
        await mutateTemplate({
            ...template,
            ...{is_archived}
        });
    };

    const handleFormSubmit = async values => {
        setFormStatus({feedback: '', status: RequestType.PENDING});

        values.confirmation_options = values.confirmation_options.map(option => ({
            label: option
        }));

        try {
            await fetch(
                `/api/templates/${templateId}/update`,
                fetchOptions({body: values, method: 'put'})
            );
            await mutateTemplate({
                ...template,
                ...values,
                ...{confirmation_options: values.confirmation_options.map(i => i.label)}
            });

            addToast({
                title: strings.templatesSections.updateDocument.success.title,
                text: strings.templatesSections.updateDocument.success.text,
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
        <PageWrapper language={template?.data?.primary_language}>
            <RoleRestriction action="templates:update" redirect="/">
                <SEO title={strings.templatesSections.consent.update.title} />
                <PageHeader
                    breadcrumbNav={[{label: 'All templates', url: '/templates'}, {label: 'Update'}]}
                    secondaryCta={{
                        label: 'Back',
                        icon: 'chevron-left',
                        iconPosition: 'left',
                        url: '/templates'
                    }}
                    title={strings.templatesSections.consent.update.title}
                />

                {template?.data?.primary_language === 'ar' && (
                    <div className="mb-6 sm:mb-8">
                        <InfoBanner text={strings.generic.primaryLanguageWarning} />
                    </div>
                )}

                <Form.Container
                    {...consentSchema}
                    handleSubmit={handleFormSubmit}
                    initialValues={{
                        ...pick(template?.data, [
                            ...Object.keys(consentSchema.fields),
                            ...['primary_language']
                        ]),
                        ...{
                            confirmation_options: template?.data?.confirmation_options?.map(
                                i => i.label
                            )
                        }
                    }}
                    name="template-consent-update-form"
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

                <RoleRestriction action="templates:archive">
                    <Divider hideAtMobile={true} />
                    <ArchiveDocument
                        collection="templatesSections"
                        handleUpdate={handleArchiveUpdate}
                        id={templateId?.toString()}
                        isArchived={template?.data?.is_archived}
                        queryParams={`type=${template?.data?.type}`}
                    />
                </RoleRestriction>
            </RoleRestriction>
        </PageWrapper>
    );
};

export default TemplateQuestionUpdatePage;
