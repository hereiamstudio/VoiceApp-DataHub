import React, {useContext, useState} from 'react';
import {useRouter} from 'next/router';
import Form from '@/components/Form';
import FormSection from '@/components/FormSection';
import PageHeader from '@/components/PageHeader';
import PageWrapper from '@/components/PageWrapper';
import SEO from '@/components/SEO';
import ToastContext from '@/components/Toast/context';
import strings from '@/locales/en.json';
import {probingQuestionSchema} from '@/schemas/template';
import {RequestType} from '@/types/request';
import fetch, {fetchOptions} from '@/utils/fetch';
import {INTERVIEW_LANGUAGES} from '@/utils/interviews';
import {QUESTION_TYPES} from '@/utils/questions';

const TemplateProbingQuestionCreatePage: React.FC = () => {
    const router = useRouter();
    const [formStatus, setFormStatus] = useState({feedback: '', status: RequestType.DEFAULT});
    const {addToast} = useContext(ToastContext);

    const handleFormSubmit = async (values: Object) => {
        setFormStatus({feedback: '', status: RequestType.PENDING});

        try {
            await fetch(
                `/api/templates/create`,
                fetchOptions({body: {...values, type: 'probing_question'}, method: 'post'})
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
            <SEO title={strings.templatesSections.probing_question.create.title} />
            <PageHeader
                breadcrumbNav={[{label: 'All templates', url: '/templates'}, {label: 'Create'}]}
                secondaryCta={{
                    label: 'Back',
                    icon: 'chevron-left',
                    iconPosition: 'left',
                    url: '/templates'
                }}
                title={strings.templatesSections.probing_question.create.title}
            />

            <Form.Container
                {...probingQuestionSchema}
                handleSubmit={handleFormSubmit}
                initialValues={{question_type: 'free_text'}}
                name="template-probing-question-create-form"
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
        </PageWrapper>
    );
};

export default TemplateProbingQuestionCreatePage;
