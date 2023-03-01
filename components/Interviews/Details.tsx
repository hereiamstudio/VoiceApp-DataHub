import React, {useContext, useState} from 'react';
import {useRouter} from 'next/router';
import pick from 'lodash/pick';
import AlertModal from '@/components/AlertModal';
import Form from '@/components/Form';
import FormSection from '@/components/FormSection';
import Icon from '@/components/Icon';
import InfoBanner from '@/components/InfoBanner';
import ModalContext from '@/components/Modal/context';
import SEO from '@/components/SEO';
import ToastContext from '@/components/Toast/context';
import strings from '@/locales/en.json';
import {detailsSchema, consentSchema} from '@/schemas/interview';
import {ModalVisibility} from '@/types/index';
import {OfflineLocales} from '@/types/interview';
import {RequestType} from '@/types/request';
import fetch, {fetchOptions} from '@/utils/fetch';
import {INTERVIEW_LANGUAGES, INTERVIEW_LOCALES, INTERVIEW_STATUSES} from '@/utils/interviews';

interface Props {
    interview: any;
    interviewId: string;
    isLocked?: boolean;
    mutateInterview: Function;
    projectId: string;
}

const InterviewDetails: React.FC<Props> = ({
    interview,
    interviewId,
    isLocked,
    mutateInterview,
    projectId
}: Props) => {
    const router = useRouter();
    const [formStatus, setFormStatus] = useState({feedback: '', status: RequestType.DEFAULT});
    const {hideModal, modalContext, modalKey, showModal, visibility} = useContext(ModalContext);
    const {addToast} = useContext(ToastContext);

    const handleFormSubmit = async (values: Object, redirect?: string) => {
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

    const confirmConsentAndStatusBeforeFormSubmit = values => {
        if (values.status !== interview.status) {
            showModal('statusUpdate', values);
        } else {
            handleFormSubmit(values);
        }
    };

    const handleSubmitWithoutStatusChange = (values, redirect) => {
        /**
         * The user has confirmed they wish to update the other details, even if they can't update the status.
         * Revert the status back to the original version.
         */
        values.status = interview.status;

        handleFormSubmit(values, redirect);

        /**
         * We can close the modal as we no longer need it.
         */
        hideModal();
    };

    /**
     * We do not need to check current consent values as this check will only ever be used when changing
     * the status, which is a different form. So, we can rely solely on the content on the interview object.
     */
    const hasCompletedConsent = async () => {
        const isStep1Valid = await consentSchema.schema.isValid(interview.consent_step_1);
        let isStep2Valid = true;

        if (interview.consent_step_2?.title) {
            isStep2Valid = await consentSchema.schema.isValid(interview.consent_step_2);
        }

        return isStep1Valid && isStep2Valid;
    };

    const handleConfirmedFormSubmit = async values => {
        /**
         * If the Interview is changing to active, we need to confirm there is questions first.
         */
        if (values.status === 'active') {
            const interviewQuestions = await fetch(
                `/api/questions?projectId=${projectId}&interviewId=${interviewId}`,
                fetchOptions()
            );
            const hasQuestions = interviewQuestions?.length;
            const hasConsent = await hasCompletedConsent();

            if (!hasConsent) {
                /**
                 * If the consent script or questions are not defined we cannot continue. Consent information must be
                 * provided for the interview.
                 */
                showModal('consentEmpty');
            } else if (!hasQuestions) {
                /**
                 * If there are no questions we need to show the user feedback that confirms questions are missing.
                 * Questions are requird for an interview to be taken.
                 */
                showModal('questionsEmpty');
            } else {
                handleFormSubmit(values);

                /**
                 * We can close the modal as we no longer need it.
                 */
                hideModal();
            }
        } else {
            handleFormSubmit(values);

            /**
             * We can close the modal as we no longer need it.
             */
            hideModal();
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
                {...detailsSchema}
                components={{
                    InterviewStatus: ({values}) => {
                        if (values.status) {
                            return (
                                <div className="col-span-6 sm:col-span-3 sm:pt-6">
                                    <strong className="text-sm font-medium text-gray-800">
                                        {strings.interviewsStatuses[values.status].text}
                                    </strong>
                                    <ul className="ml-4 list-outside list-disc text-sm text-gray-600">
                                        {strings.interviewsStatuses[values.status].actions.map(
                                            action => (
                                                <li key={action}>{action}</li>
                                            )
                                        )}
                                    </ul>
                                </div>
                            );
                        }
                    },
                    LocaleOfflineSupport: ({values}) => {
                        if (values.locale || values.primary_language) {
                            // Catch if a locale has been selected, but then the primary language
                            // changes (this does not reset the selected locale)
                            if (!values.locale.startsWith(values.primary_language)) {
                                return null;
                            }

                            const isAvailableOffline = values?.locale in OfflineLocales;

                            return (
                                <div className="-mt-3 -mb-6 flex justify-end text-xs">
                                    {isAvailableOffline ? (
                                        <span className="flex items-center space-x-1 text-green-500">
                                            <Icon name="check" classes="w-4 h-4" />
                                            <span>Speech to Text will work offline</span>
                                        </span>
                                    ) : (
                                        <span className="flex items-center space-x-1 text-red-500">
                                            <Icon name="cross" classes="w-4 h-4" />
                                            <span>Speech to Text will not work offline</span>
                                        </span>
                                    )}
                                </div>
                            );
                        }
                    }
                }}
                handleSubmit={confirmConsentAndStatusBeforeFormSubmit}
                initialValues={pick(interview, Object.keys(detailsSchema.fields))}
                name="interview-details-update-form"
                options={{
                    locale: ({primary_language}) => {
                        return INTERVIEW_LOCALES.filter(({value}) =>
                            value.startsWith(primary_language)
                        ).map(({label, value}) => {
                            const isAvailableOffline = value in OfflineLocales;

                            return {
                                label: `${label}${isAvailableOffline ? ' (Works offline)' : ''}`,
                                value
                            };
                        });
                    },
                    primary_language: () => {
                        return Object.keys(INTERVIEW_LANGUAGES).map(languageKey => ({
                            label: INTERVIEW_LANGUAGES[languageKey],
                            value: languageKey
                        }));
                    },
                    status: () => {
                        return Object.keys(INTERVIEW_STATUSES).map(statusKey => ({
                            label: INTERVIEW_STATUSES[statusKey],
                            value: statusKey
                        }));
                    }
                }}
                status={formStatus.status}
            >
                <FormSection
                    error={formStatus.status === RequestType.ERROR ? formStatus.feedback : null}
                    name="templatesFields"
                    status={formStatus.status}
                    showSubmit={!isLocked}
                    submitLabel={strings.interviewsUpdate.details.submit}
                    text={strings.interviewsUpdate.details.text}
                    title={strings.interviewsUpdate.details.title}
                >
                    <div className="relative">
                        <Form.Fields />
                        <Form.Errors />
                        {isLocked && (
                            <div className="absolute left-0 top-0 right-0 bottom-0 bg-white opacity-30" />
                        )}
                    </div>
                </FormSection>
            </Form.Container>
            <AlertModal
                cancelCta={{
                    label: strings.interviewsUpdate.status.cancel,
                    onClick: () => hideModal()
                }}
                confirmCta={{
                    label: strings.interviewsUpdate.status.submit,
                    onClick: () => handleConfirmedFormSubmit(modalContext)
                }}
                handleHide={hideModal}
                text={strings.interviewsUpdate.status[`text_${modalContext?.status}`]}
                title={strings.interviewsUpdate.status.title}
                visibility={modalKey === 'statusUpdate' ? visibility : ModalVisibility.HIDDEN}
            />
            <AlertModal
                cancelCta={{
                    label: strings.interviewsUpdate.questionsEmpty.cancel,
                    onClick: () => hideModal()
                }}
                confirmCta={{
                    label: strings.interviewsUpdate.questionsEmpty.submit,
                    onClick: () => {
                        handleSubmitWithoutStatusChange(
                            modalContext,
                            `/projects/${projectId}/interviews/${interviewId}/questions`
                        );
                    }
                }}
                handleHide={hideModal}
                text={strings.interviewsUpdate.questionsEmpty.text}
                title={strings.interviewsUpdate.questionsEmpty.title}
                type="error"
                visibility={modalKey === 'questionsEmpty' ? visibility : ModalVisibility.HIDDEN}
            />
            <AlertModal
                cancelCta={{
                    label: strings.interviewsUpdate.consentEmpty.cancel,
                    onClick: () => hideModal()
                }}
                confirmCta={{
                    label: strings.interviewsUpdate.consentEmpty.submit,
                    onClick: () => {
                        handleSubmitWithoutStatusChange(
                            modalContext,
                            `/projects/${projectId}/interviews/${interviewId}/consent`
                        );
                    }
                }}
                handleHide={hideModal}
                text={strings.interviewsUpdate.consentEmpty.text}
                title={strings.interviewsUpdate.consentEmpty.title}
                type="error"
                visibility={modalKey === 'consentEmpty' ? visibility : ModalVisibility.HIDDEN}
            />
        </>
    );
};

export default InterviewDetails;
