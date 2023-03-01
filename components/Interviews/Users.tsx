import React, {useContext, useState} from 'react';
import {useRouter} from 'next/router';
import {useSession} from 'next-auth/react';
import ActivityIndicator from '@/components/ActivityIndicator';
import AssignUsers from '@/components/AssignUsers';
import Form from '@/components/Form';
import FormSection from '@/components/FormSection';
import InfoBanner from '@/components/InfoBanner';
import SEO from '@/components/SEO';
import ToastContext from '@/components/Toast/context';
import strings from '@/locales/en.json';
import {usersSchema} from '@/schemas/interview';
import {RequestType} from '@/types/request';
import fetch, {fetchOptions} from '@/utils/fetch';

interface Props {
    interview: any;
    interviewId: string;
    isLocked?: boolean;
    mutateInterview: Function;
    projectId: string;
}

const InterviewUsers: React.FC<Props> = ({
    interview,
    interviewId,
    isLocked,
    mutateInterview,
    projectId
}: Props) => {
    const router = useRouter();
    const {data: session} = useSession();
    const [formStatus, setFormStatus] = useState({feedback: '', status: RequestType.DEFAULT});
    const {addToast} = useContext(ToastContext);

    const handleFormSubmit = async (values: any, redirect?: string) => {
        setFormStatus({feedback: '', status: RequestType.PENDING});

        try {
            await fetch(
                `/api/interviews/${interviewId}/update?projectId=${projectId}`,
                fetchOptions({body: {...values, project: interview.project}, method: 'put'})
            );
            await mutateInterview({
                ...interview,
                ...values
            });

            addToast({
                title: strings.interviewsUpdate.details.updateSuccess.title,
                text: strings.interviewsUpdate.details.updateSuccess.text,
                type: 'success'
            });
            setFormStatus({feedback: '', status: RequestType.DEFAULT});

            if (redirect) {
                router.push(redirect);
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

    return (
        <>
            <SEO title={strings.interviewsUpdate.title} />

            {isLocked && (
                <div className="mb-6">
                    <InfoBanner text={strings.interviewsUpdate.detailsLocked} theme="warning" />
                </div>
            )}

            <Form.Container
                {...usersSchema}
                handleSubmit={values => handleFormSubmit(values)}
                initialValues={{assigned_users: interview?.assigned_users}}
                name="interview-update-users-form"
                status={formStatus.status}
            >
                {formikProps => (
                    <FormSection
                        name="projectUpdate.users"
                        status={formStatus.status}
                        submitLabel={strings.interviewsUpdate.users.submit}
                        showSubmit={!isLocked}
                        text={strings.interviewsUpdate.users.text}
                        title={strings.interviewsUpdate.users.title}
                    >
                        {interview?.assigned_users ? (
                            <div className="animate-fade-in">
                                <AssignUsers
                                    activeUserId={session.user.uid}
                                    assignedUsers={interview?.assigned_users}
                                    endpoint="available-for-projects"
                                    handleChange={selectedUsers => {
                                        formikProps.setFieldValue('assigned_users', selectedUsers);
                                    }}
                                    isLocked={isLocked}
                                    ownerId={interview?.created_by.id}
                                    projectId={projectId}
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
        </>
    );
};

export default InterviewUsers;
