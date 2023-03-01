import React, {useContext, useState} from 'react';
import {useRouter} from 'next/router';
import useSWR from 'swr';
import {useSession} from 'next-auth/react';
import pick from 'lodash/pick';
import ActivityIndicator from '@/components/ActivityIndicator';
import ArchiveDocument from '@/components/ArchiveDocument';
import AssignUsers from '@/components/AssignUsers';
import Divider from '@/components/Divider';
import Form from '@/components/Form';
import FormSection from '@/components/FormSection';
import PageHeader from '@/components/PageHeader';
import PageWrapper from '@/components/PageWrapper';
import RoleRestriction from '@/components/RoleRestriction';
import SEO from '@/components/SEO';
import ToastContext from '@/components/Toast/context';
import strings from '@/locales/en.json';
import {detailsSchema, usersSchema} from '@/schemas/project';
import {RequestType} from '@/types/request';
import fetch, {fetchOptions} from '@/utils/fetch';
import {COUNTRIES} from '@/utils/countries';

const ProjectUpdatePage: React.FC = () => {
    const router = useRouter();
    const {projectId} = router.query;
    const {data: session} = useSession();
    const [formStatus, setFormStatus] = useState({feedback: '', status: RequestType.DEFAULT});
    const {addToast} = useContext(ToastContext);
    const {data: project, mutate: mutateProject} = useSWR(() =>
        projectId ? `/api/projects/${projectId}` : null
    );

    const handleArchiveUpdate = async is_archived => {
        await mutateProject({
            ...project,
            ...{is_archived}
        });

        router.push('/projects');
    };

    const handleFormSubmit = async (values: Object) => {
        setFormStatus({feedback: '', status: RequestType.PENDING});

        try {
            await fetch(
                `/api/projects/${projectId}/update`,
                fetchOptions({body: values, method: 'put'})
            );
            await mutateProject({
                ...project,
                ...values
            });

            addToast({
                title: strings.projectsUpdate.details.updateSuccess.title,
                text: strings.projectsUpdate.details.updateSuccess.text,
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
            <SEO title={strings.projectsUpdate.title} />
            <PageHeader
                breadcrumbNav={[
                    {label: 'All projects', url: '/projects'},
                    {
                        label: project?.data?.title || '-',
                        url: `/projects/${projectId}/interviews`
                    },
                    {label: 'Update'}
                ]}
                secondaryCta={{
                    label: 'Back',
                    icon: 'chevron-left',
                    iconPosition: 'left',
                    url: '/projects'
                }}
                title={strings.projectsUpdate.title}
            />

            <Form.Container
                {...detailsSchema}
                handleSubmit={handleFormSubmit}
                initialValues={pick(project?.data, Object.keys(detailsSchema.fields))}
                name="project-update-form"
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
                    name="projectsUpdate.project"
                    status={formStatus.status}
                    submitLabel={strings.projectsUpdate.details.submit}
                    text={strings.projectsUpdate.details.text}
                    title={strings.projectsUpdate.details._title}
                >
                    <Form.Fields />
                    <Form.Errors />
                </FormSection>
            </Form.Container>

            <Divider hideAtMobile={true} />

            <Form.Container
                {...usersSchema}
                handleSubmit={handleFormSubmit}
                initialValues={{assigned_users: project?.data?.assigned_users}}
                name="project-update-users-form"
                status={formStatus.status}
            >
                {formikProps => (
                    <FormSection
                        name="projectUpdate.users"
                        status={formStatus.status}
                        submitLabel={strings.projectsUpdate.users.submit}
                        text={strings.projectsUpdate.users.text}
                        title={strings.projectsUpdate.users.title}
                    >
                        {project?.data?.assigned_users ? (
                            <div className="animate-fade-in">
                                <AssignUsers
                                    activeUserId={session.user.uid}
                                    assignedUsers={project.data.assigned_users}
                                    endpoint="available-for-projects"
                                    handleChange={selectedUsers => {
                                        formikProps.setFieldValue('assigned_users', selectedUsers);
                                    }}
                                    ownerId={project.data.created_by.id}
                                />
                            </div>
                        ) : (
                            <div className="m-auto h-5 w-5">
                                <ActivityIndicator />
                            </div>
                        )}
                    </FormSection>
                )}
            </Form.Container>

            <RoleRestriction action="projects:archive">
                <Divider hideAtMobile={true} />
                <ArchiveDocument
                    collection="projects"
                    handleUpdate={handleArchiveUpdate}
                    id={projectId?.toString()}
                    isArchived={project?.data?.is_archived}
                />
            </RoleRestriction>
        </PageWrapper>
    );
};

export default ProjectUpdatePage;
