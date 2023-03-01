import React, {useContext, useState} from 'react';
import {useRouter} from 'next/router';
import pick from 'lodash/pick';
import Button from '@/components/Button';
import ConfirmationModal from '@/components/ConfirmationModal';
import DividerWithButton from '@/components/DividerWithButton';
import Form from '@/components/Form';
import FormSection from '@/components/FormSection';
import InfoBanner from '@/components/InfoBanner';
import ModalContext from '@/components/Modal/context';
import SEO from '@/components/SEO';
import {SlideOver, SlideOverContent, SlideOverFooter} from '@/components/Modal/slideOver';
import TemplateSelectionList from '@/components/TemplateSelectionList';
import ToastContext from '@/components/Toast/context';
import strings from '@/locales/en.json';
import {consentSchema} from '@/schemas/interview';
import {ModalVisibility} from '@/types/index';
import {RequestType} from '@/types/request';
import fetch, {fetchOptions} from '@/utils/fetch';

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
    const [hasSecondConsent, setHasSecondConsent] = useState(interview?.consent_step_2?.title);
    const [formStatus, setFormStatus] = useState({feedback: '', status: RequestType.DEFAULT});
    const {hideModal, modalContext, modalKey, showModal, visibility} = useContext(ModalContext);
    const {addToast} = useContext(ToastContext);

    const updateConsentFromTemplate = async (template: any, step: number) => {
        interview[`consent_step_${step}`] = pick(template.data, Object.keys(consentSchema.fields));
    };

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

    /**
     * Add additional required fields for consent data.
     */
    const handleConsentFormSubmit = async (step: string, values: any) => {
        const updatedValues = {
            ...values,
            confirmation_options: values.confirmation_options.map(
                (option: string, index: number) => {
                    if (!option.hasOwnProperty('is_correct')) {
                        return {
                            label: option,
                            is_correct: index === 0,
                            order: index + 1
                        };
                    }

                    return option;
                }
            )
        };

        return handleFormSubmit({[step]: updatedValues});
    };

    const handleRemoveSecondConsent = async () => {
        await handleFormSubmit({
            ...interview,
            consent_step_2: null
        });
        setHasSecondConsent(false);
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
                {...consentSchema}
                handleSubmit={values => handleConsentFormSubmit('consent_step_1', values)}
                initialValues={{
                    ...pick(interview.consent_step_1, Object.keys(consentSchema.fields)),
                    ...{
                        confirmation_options: interview.consent_step_1?.confirmation_options?.map(
                            i => i.label
                        )
                    }
                }}
                name="template-consent-update-form"
                status={formStatus.status}
            >
                <FormSection
                    error={formStatus.status === RequestType.ERROR ? formStatus.feedback : null}
                    name="templatesFields"
                    sideChildren={
                        !isLocked && (
                            <Button
                                onClick={() => showModal('templateSelector', {consent_step: 1})}
                                theme="secondary"
                            >
                                {strings.interviewsUpdate.useConsentTemplate.addCta}
                            </Button>
                        )
                    }
                    showSubmit={!isLocked}
                    status={formStatus.status}
                    submitLabel={strings.interviewsUpdate.consent_step_1.submit}
                    text={strings.interviewsUpdate.consent_step_1.text}
                    title={strings.interviewsUpdate.consent_step_1._title}
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
            <div className="mt-10" />
            {hasSecondConsent && (
                <Form.Container
                    {...consentSchema}
                    handleSubmit={values => handleConsentFormSubmit('consent_step_2', values)}
                    initialValues={{
                        ...pick(interview.consent_step_2, Object.keys(consentSchema.fields)),
                        ...{
                            confirmation_options:
                                interview.consent_step_2?.confirmation_options?.map(i => i.label)
                        }
                    }}
                    name="template-consent-update-form"
                    status={formStatus.status}
                >
                    <FormSection
                        error={formStatus.status === RequestType.ERROR ? formStatus.feedback : null}
                        name="templatesFields"
                        sideChildren={
                            !isLocked && (
                                <div className="flex space-x-2">
                                    <Button
                                        onClick={() =>
                                            showModal('templateSelector', {consent_step: 2})
                                        }
                                        theme="secondary"
                                    >
                                        {strings.interviewsUpdate.useConsentTemplate.addCta}
                                    </Button>
                                    <Button
                                        onClick={() => showModal('removeConsentStep2')}
                                        theme="destructive"
                                    >
                                        {strings.interviewsUpdate.useConsentTemplate.removeCta}
                                    </Button>
                                </div>
                            )
                        }
                        status={formStatus.status}
                        showSubmit={!isLocked}
                        submitLabel={strings.interviewsUpdate.consent_step_2.submit}
                        text={strings.interviewsUpdate.consent_step_2.text}
                        title={strings.interviewsUpdate.consent_step_2._title}
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
            )}
            {!hasSecondConsent && !isLocked && (
                <DividerWithButton
                    handleClick={() => setHasSecondConsent(true)}
                    label="Add second consent step"
                />
            )}

            <SlideOver
                handleClose={hideModal}
                visibility={modalKey === 'templateSelector' ? visibility : ModalVisibility.HIDDEN}
            >
                <SlideOverContent
                    handleClose={hideModal}
                    text={strings.templatesSelector.text}
                    title={strings.templatesSelector.title}
                >
                    <TemplateSelectionList
                        handleCancel={hideModal}
                        handleSelect={template => {
                            if (template) {
                                updateConsentFromTemplate(template, modalContext.consent_step);
                            }
                        }}
                        language={interview?.primary_language}
                        type="consent"
                    />
                </SlideOverContent>
                <SlideOverFooter handleClose={hideModal} />
            </SlideOver>

            <ConfirmationModal
                cancelCta={{
                    label: strings.interviewsUpdate.useConsentTemplate.remove.cancel,
                    onClick: () => hideModal()
                }}
                confirmCta={{
                    label: strings.interviewsUpdate.useConsentTemplate.remove.submit,
                    onClick: () => {
                        hideModal();
                        handleRemoveSecondConsent();
                    }
                }}
                handleHide={hideModal}
                text={strings.interviewsUpdate.useConsentTemplate.remove.text}
                title={strings.interviewsUpdate.useConsentTemplate.remove.title}
                visibility={modalKey === 'removeConsentStep2' ? visibility : ModalVisibility.HIDDEN}
            />
        </>
    );
};

export default InterviewDetails;
