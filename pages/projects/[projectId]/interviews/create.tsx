import React, {useContext, useState} from 'react';
import {useRouter} from 'next/router';
import useSWR from 'swr';
import Form from '@/components/Form';
import FormSection from '@/components/FormSection';
import PageHeader from '@/components/PageHeader';
import PageWrapper from '@/components/PageWrapper';
import SEO from '@/components/SEO';
import ToastContext from '@/components/Toast/context';
import strings from '@/locales/en.json';
import {detailsSchema} from '@/schemas/interview';
import {RequestType} from '@/types/request';
import fetch, {fetchOptions} from '@/utils/fetch';
import {INTERVIEW_LANGUAGES, INTERVIEW_LOCALES} from '@/utils/interviews';

const InterviewCreatePage = () => {
    const router = useRouter();
    const {projectId} = router.query;
    const [formStatus, setFormStatus] = useState({feedback: '', status: RequestType.DEFAULT});
    const {addToast} = useContext(ToastContext);
    const {data: project} = useSWR(`/api/projects/${projectId}?minimal=true`);

    const handleFormSubmit = async (values: Object) => {
        setFormStatus({feedback: '', status: RequestType.PENDING});

        try {
            const response = await fetch(
                `/api/interviews/create?projectId=${projectId}`,
                fetchOptions({body: values, method: 'post'})
            );

            addToast({
                title: strings.interviewsCreate.interview.createSuccess.title,
                text: strings.interviewsCreate.interview.createSuccess.text,
                type: 'success'
            });
            setFormStatus({feedback: '', status: RequestType.DEFAULT});
            router.push(`/projects/${projectId}/interviews/${response.id}/overview`);
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
            <SEO title={strings.interviewsCreate.title} />
            <PageHeader
                breadcrumbNav={[
                    {label: 'All projects', url: '/projects'},
                    {
                        label: project?.title || 'Project',
                        url: `/projects/${projectId}/update`
                    },
                    {label: 'Create interview'}
                ]}
                secondaryCta={{
                    label: 'Back',
                    icon: 'chevron-left',
                    iconPosition: 'left',
                    url: `/projects/${projectId}/interviews`
                }}
                title={strings.interviewsCreate.title}
            />

            <Form.Container
                fields={{
                    ...detailsSchema.fields,
                    status: {field: 'input', type: 'hidden', value: 'draft'}
                }}
                schema={detailsSchema.schema}
                handleSubmit={handleFormSubmit}
                initialValues={{
                    ...(project ? {project: {title: project.title, id: project.id}} : {}),
                    ...{primary_language: 'en'}
                }}
                name="interview-create-form"
                options={{
                    locale: ({primary_language}) => {
                        return INTERVIEW_LOCALES.filter(({value}) =>
                            value.startsWith(primary_language)
                        );
                    },
                    primary_language: () => {
                        return Object.keys(INTERVIEW_LANGUAGES).map(languageKey => {
                            return {
                                label: INTERVIEW_LANGUAGES[languageKey],
                                value: languageKey
                            };
                        });
                    }
                }}
                status={formStatus.status}
            >
                <FormSection
                    error={formStatus.status === RequestType.ERROR ? formStatus.feedback : null}
                    name="interviewsCreate.interview"
                    status={formStatus.status}
                    submitLabel={strings.interviewsCreate.interview.submit}
                    text={strings.interviewsCreate.interview.text}
                    title={strings.interviewsCreate.interview._title}
                >
                    <Form.Fields />
                    <Form.Errors />
                </FormSection>
            </Form.Container>
        </PageWrapper>
    );
};

export default InterviewCreatePage;
