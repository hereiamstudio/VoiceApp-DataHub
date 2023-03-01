import React, {useContext, useState} from 'react';
import {useRouter} from 'next/router';
import useSWR from 'swr';
import pick from 'lodash/pick';
import Form from '@/components/Form';
import ArchiveDocument from '@/components/ArchiveDocument';
import Divider from '@/components/Divider';
import FormSection from '@/components/FormSection';
import InfoBanner from '@/components/InfoBanner';
import PageHeader from '@/components/PageHeader';
import PageWrapper from '@/components/PageWrapper';
import RoleRestriction from '@/components/RoleRestriction';
import SEO from '@/components/SEO';
import ToastContext from '@/components/Toast/context';
import strings from '@/locales/en.json';
import {probingQuestionSchema} from '@/schemas/template';
import {RequestType} from '@/types/request';
import fetch, {fetchOptions} from '@/utils/fetch';
import {INTERVIEW_LANGUAGES} from '@/utils/interviews';
import {QUESTION_TYPES} from '@/utils/questions';

const TemplateProbingQuestionUpdatePage: React.FC = () => {
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

    const handleFormSubmit = async (values: Object) => {
        setFormStatus({feedback: '', status: RequestType.PENDING});

        try {
            await fetch(
                `/api/templates/${templateId}/update`,
                fetchOptions({body: values, method: 'put'})
            );
            await mutateTemplate({
                ...template,
                ...values
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
            <SEO title={strings.templatesSections.probing_question.update.title} />
            <PageHeader
                breadcrumbNav={[{label: 'All templates', url: '/templates'}, {label: 'Update'}]}
                secondaryCta={{
                    label: 'Back',
                    icon: 'chevron-left',
                    iconPosition: 'left',
                    url: '/templates'
                }}
                title={strings.templatesSections.probing_question.update.title}
            />

            {template?.data?.primary_language === 'ar' && (
                <div className="mb-6 sm:mb-8">
                    <InfoBanner text={strings.generic.primaryLanguageWarning} />
                </div>
            )}

            <Form.Container
                {...probingQuestionSchema}
                handleSubmit={handleFormSubmit}
                initialValues={pick(template?.data, Object.keys(probingQuestionSchema.fields))}
                name="template-probing-question-update-form"
                options={{
                    primary_language: () => {
                        return Object.keys(INTERVIEW_LANGUAGES).map(languageKey => ({
                            label: INTERVIEW_LANGUAGES[languageKey],
                            value: languageKey
                        }));
                    },
                    question_type: () => {
                        return Object.keys(QUESTION_TYPES).map(typeKey => ({
                            label: QUESTION_TYPES[typeKey],
                            value: typeKey
                        }));
                    }
                }}
                status={formStatus.status}
            >
                <FormSection
                    error={formStatus.status === RequestType.ERROR ? formStatus.feedback : null}
                    name="templatesFields"
                    status={formStatus.status}
                    submitLabel={strings.templatesSections.createDocument.submit}
                    text={strings.templatesSections.probing_question.details.text}
                    title={strings.templatesSections.probing_question.details.title}
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
        </PageWrapper>
    );
};

export default TemplateProbingQuestionUpdatePage;
