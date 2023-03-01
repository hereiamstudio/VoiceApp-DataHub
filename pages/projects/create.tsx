import React, {useContext, useState} from 'react';
import {useRouter} from 'next/router';
import Form from '@/components/Form';
import FormSection from '@/components/FormSection';
import PageHeader from '@/components/PageHeader';
import PageWrapper from '@/components/PageWrapper';
import SEO from '@/components/SEO';
import ToastContext from '@/components/Toast/context';
import strings from '@/locales/en.json';
import {detailsSchema} from '@/schemas/project';
import fetch, {fetchOptions} from '@/utils/fetch';
import {COUNTRIES} from '@/utils/countries';
import {RequestType} from '@/types/request';

const ProjectCreatePage: React.FC = () => {
    const router = useRouter();
    const [formStatus, setFormStatus] = useState({feedback: '', status: RequestType.DEFAULT});
    const {addToast} = useContext(ToastContext);

    const handleFormSubmit = async (values: Object) => {
        setFormStatus({feedback: '', status: RequestType.PENDING});

        try {
            const response = await fetch(
                `/api/projects/create`,
                fetchOptions({body: values, method: 'post'})
            );

            addToast({
                title: strings.projectsCreate.project.createSuccess.title,
                text: strings.projectsCreate.project.createSuccess.text,
                type: 'success'
            });
            setFormStatus({feedback: '', status: RequestType.DEFAULT});
            router.push(`/projects/${response.id}/update#assignusers`);
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
            <SEO title={strings.projectsCreate.title} />
            <PageHeader
                breadcrumbNav={[{label: 'All projects', url: '/projects'}, {label: 'Create'}]}
                secondaryCta={{
                    label: 'Back',
                    icon: 'chevron-left',
                    iconPosition: 'left',
                    url: '/projects'
                }}
                title={strings.projectsCreate.title}
            />
            <Form.Container
                {...detailsSchema}
                handleSubmit={handleFormSubmit}
                name="project-create-form"
                options={{
                    location_country: () => {
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
                    name="projectsCreate.project"
                    status={formStatus.status}
                    submitLabel={strings.projectsCreate.project.submit}
                    text={strings.projectsCreate.project.text}
                    title={strings.projectsCreate.project._title}
                >
                    <Form.Fields />
                    <Form.Errors />
                </FormSection>
            </Form.Container>
        </PageWrapper>
    );
};

export default ProjectCreatePage;
