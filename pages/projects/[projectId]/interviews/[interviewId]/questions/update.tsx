import React, {useContext, useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import useSWR, {useSWRConfig} from 'swr';
import pick from 'lodash/pick';
import AddSelectOptions from '@/components/AddSelectOptions';
import Button from '@/components/Button';
import Dropdown from '@/components/Dropdown';
import EmptyPanel from '@/components/EmptyPanel';
import Form from '@/components/Form';
import FormListener from '@/components/Form/Listener';
import useWarnIfUnsavedChanges from '@/components/Form/useWarnIfUnsavedChanges';
import InfoBanner from '@/components/InfoBanner';
import ModalContext from '@/components/Modal/context';
import QuestionsImportModal from '@/components/QuestionsImportModal';
import QuestionManagementItem from '@/components/Interviews/QuestionManagementItem';
import InterviewTabBar from '@/components/Interviews/TabBar';
import QuestionManagementItemPlaceholder from '@/components/Interviews/QuestionManagementItemPlaceholder';
import QuestionSkipNav from '@/components/Interviews/QuestionSkipNav';
import PageHeader from '@/components/PageHeader';
import PageWrapper from '@/components/PageWrapper';
import SEO from '@/components/SEO';
import {SlideOver, SlideOverContent, SlideOverFooter} from '@/components/Modal/slideOver';
import ToastContext from '@/components/Toast/context';
import TemplateSelectionList from '@/components/TemplateSelectionList';
import strings from '@/locales/en.json';
import {questionSchema} from '@/schemas/question';
import {RequestType} from '@/types/request';
import {getSchemaDefaultFieldValues, getRandomId} from '@/utils/helpers';
import fetch, {fetchOptions} from '@/utils/fetch';
import {QUESTION_TYPES} from '@/utils/questions';
import {ModalVisibility} from '@/types/index';

const SAVED_QUESTION_FIELDS = ['title', 'options', 'type', 'description', 'order', 'skip_logic'];

const QuestionsUpdatePage: React.FC = () => {
    const router = useRouter();
    const {projectId, interviewId} = router.query;
    const [formChanges, setFormChanges] = useState<number>(0);
    const [formStatus, setFormStatus] = useState({feedback: '', status: RequestType.DEFAULT});
    const [formValues, setFormValues] = useState({});
    const [formInfo, setFormInfo] = useState({added: [], removed: []});
    const [newestQuestionId, setNewestQuestionId] = useState<string>();
    const {hideModal, modalContext, modalKey, showModal, visibility} = useContext(ModalContext);
    const {addToast} = useContext(ToastContext);
    const {mutate} = useSWRConfig();

    const {data: interview} = useSWR(
        interviewId && projectId
            ? `/api/interviews/${interviewId}?projectId=${projectId}&minimal=true`
            : null
    );
    const isLocked = interview?.status !== 'draft';
    const {data: allQuestions, isValidating} = useSWR(
        interviewId && projectId
            ? `/api/questions?projectId=${projectId}&interviewId=${interviewId}`
            : null
    );

    const hasFormChanged = true;
    // const hasFormChanged = useWarnIfUnsavedChanges(
    //     !isLocked && (formChanges > Object.keys(formValues).length || !!newestQuestionId)
    // );

    const handleAddedQuestion = (questionId: any) => {
        setFormInfo(previousFormInfo => ({
            ...previousFormInfo,
            added: [...previousFormInfo.added, questionId]
        }));
        setNewestQuestionId(questionId);
        setTimeout(() => {
            document.querySelector('#questions-end').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 100);
    };

    const createNewQuestionFromTemplate = (template: any) => {
        const newQuestionId = getRandomId();

        setFormValues({
            ...formValues,
            [newQuestionId]: {
                is_active: true,
                is_archived: false,
                options: template.data.question_options,
                order: (Object.keys(formValues).length + 1) * 100,
                title: template.data.question_title,
                type: template.data.question_type
            }
        });
        handleAddedQuestion(newQuestionId);
    };

    const handleAddQuestion = (questionData?: any) => {
        const newQuestionId = getRandomId();

        setFormValues(previousFormValues => ({
            ...previousFormValues,
            [newQuestionId]: {
                ...(questionData
                    ? questionData
                    : getSchemaDefaultFieldValues(questionSchema.schema.fields)),
                order: (Object.keys(previousFormValues).length + 1) * 100,
                options: questionData?.options || [],
                project: {title: interview.project.title, id: interview.project.id},
                interview: {title: interview.title, id: interview.id}
            }
        }));
        handleAddedQuestion(newQuestionId);
    };

    const handleImportedQuestions = questions => questions.map(handleAddQuestion);

    const handleRemovedQuestion = async (questionId: string) => {
        const updatedFormValues = Object.keys(formValues)
            .filter(key => key !== questionId)
            .reduce(
                (acc, key) => ({
                    ...acc,
                    [key]: formValues[key]
                }),
                {}
            );

        setFormValues(updatedFormValues);
        setFormInfo({
            ...formInfo,
            added: formInfo.added.includes(questionId)
                ? formInfo.added.filter(id => id !== questionId)
                : formInfo.added,
            removed: [...formInfo.removed, questionId]
        });
    };

    const handleFormValuesUpdated = (questionId, order, values) => {
        const updatedFormValues = {
            ...formValues,
            [questionId]: pick({...values, order: order * 100}, SAVED_QUESTION_FIELDS)
        };

        setFormChanges(previousFormChanges => previousFormChanges + 1);
        setFormValues(updatedFormValues);
    };

    const handleFormSubmit = async () => {
        setFormStatus({feedback: '', status: RequestType.PENDING});

        try {
            await fetch(
                `/api/questions/update?projectId=${projectId}&interviewId=${interviewId}`,
                fetchOptions({
                    body: {
                        questions: formValues,
                        added: formInfo.added,
                        removed: formInfo.removed,
                        project: interview.project,
                        interview: {id: interview.id, title: interview.title}
                    },
                    method: 'post'
                })
            );

            setFormChanges(0);
            setFormInfo({added: [], removed: []});
            addToast({
                title: strings.questionsUpdate.details.updateSuccess.title,
                text: strings.questionsUpdate.details.updateSuccess.text,
                type: 'success'
            });
            mutate(`/api/questions?projectId=${projectId}&interviewId=${interviewId}`);
            // router.push(`/projects/${projectId}/interviews/${interviewId}/questions`);
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

    useEffect(() => {
        if (allQuestions?.length) {
            setFormValues(
                allQuestions.reduce(
                    (acc, cur) => ({
                        ...acc,
                        [cur.id]: pick(cur.data, SAVED_QUESTION_FIELDS)
                    }),
                    {}
                )
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allQuestions]);

    const allQuestionsFromFormValues = Object.keys(formValues).map(questionId => ({
        id: questionId,
        title: `${formValues[questionId].order / 100}. ${formValues[questionId].title}`
    }));

    return (
        <PageWrapper language={interview?.primary_language}>
            <SEO title={strings.questionsUpdate.title} />
            <PageHeader
                breadcrumbNav={[
                    {label: 'All projects', url: '/projects'},
                    {
                        label: interview?.project?.title || '-',
                        url: `/projects/${projectId}/interviews`
                    },
                    {
                        label: 'Interviews',
                        url: `/projects/${projectId}/interviews`
                    },
                    {
                        label: interview?.title || '-',
                        url: `/projects/${projectId}/interviews/${interviewId}/update`
                    },
                    {
                        label: 'Questions',
                        url: `/projects/${projectId}/interviews/${interviewId}/questions`
                    },
                    {label: 'Update'}
                ]}
                language={interview?.primary_language}
                secondaryCta={{
                    label: 'Back',
                    icon: 'chevron-left',
                    iconPosition: 'left',
                    url: `/projects/${projectId}/interviews/${interviewId}/questions`
                }}
                title={interview?.title}
            />

            <InterviewTabBar
                activeTab={'questions'}
                interviewId={interviewId?.toString()}
                interviewStatus={interview?.status}
                projectId={projectId?.toString()}
            />

            {isLocked && (
                <div className="mb-6">
                    <InfoBanner text={strings.interviewsUpdate.questionsLocked} theme="warning" />
                </div>
            )}

            {interview?.primary_language === 'ar' && (
                <div className="mb-4">
                    <InfoBanner text={strings.generic.primaryLanguageWarning} />
                </div>
            )}

            <div className="relative grid gap-8 lg:grid-cols-12">
                <div className="space-y-4 lg:col-span-8 xl:col-span-9">
                    {!isValidating && allQuestionsFromFormValues?.length ? (
                        Object.keys(formValues).map((questionId, index) => {
                            const question = allQuestions.find(q => q.id === questionId);
                            const questionFormValues = formValues[questionId];

                            return (
                                <Form.Container
                                    key={questionId}
                                    {...questionSchema}
                                    components={{
                                        AddSelectOptions: ({setFieldValue, values}) => {
                                            if (values.type && values.type !== 'free_text') {
                                                return (
                                                    <div className="animate-fade-in">
                                                        <AddSelectOptions
                                                            handleChange={newOptions => {
                                                                setFieldValue(
                                                                    'options',
                                                                    newOptions
                                                                );
                                                            }}
                                                            isLocked={isLocked}
                                                            name="options"
                                                            options={values.options}
                                                        />
                                                    </div>
                                                );
                                            }
                                        }
                                    }}
                                    handleSubmit={() => {}}
                                    initialValues={pick(
                                        {...question?.data, ...questionFormValues},
                                        Object.keys(questionSchema.fields)
                                    )}
                                    name="question-create-form"
                                    options={{
                                        type: () => {
                                            return Object.keys(QUESTION_TYPES).map(typeKey => ({
                                                label: QUESTION_TYPES[typeKey],
                                                value: typeKey
                                            }));
                                        }
                                    }}
                                    status={formStatus.status}
                                >
                                    <QuestionManagementItem
                                        allQuestions={allQuestionsFromFormValues}
                                        handleRemovedQuestion={handleRemovedQuestion}
                                        id={questionId}
                                        isLocked={isLocked}
                                        isNew={questionId === newestQuestionId}
                                        number={index + 1}
                                    >
                                        <Form.Fields />
                                        <Form.Errors />
                                        <div className="mb-4"></div>
                                        <FormListener
                                            handleChange={values =>
                                                handleFormValuesUpdated(
                                                    questionId,
                                                    index + 1,
                                                    values
                                                )
                                            }
                                        />
                                    </QuestionManagementItem>
                                </Form.Container>
                            );
                        })
                    ) : (
                        <div className="space-y-4">
                            {isValidating ? (
                                Array.from(Array(5).keys()).map((_, index) => (
                                    <QuestionManagementItemPlaceholder key={index} />
                                ))
                            ) : (
                                <EmptyPanel>Add a question to get started</EmptyPanel>
                            )}
                        </div>
                    )}
                </div>
                <div className="lg:col-span-4 xl:col-span-3">
                    {allQuestionsFromFormValues && (
                        <div className="sticky top-4 animate-fade-in space-y-4 rounded-lg bg-white p-4 shadow">
                            <div className="space-y-4">
                                {!isLocked && (
                                    <div>
                                        <span className="mb-1 block font-medium leading-5 text-gray-700 sm:text-sm">
                                            Add a question
                                        </span>
                                        <Dropdown
                                            display="block"
                                            label={strings.questionsList.add}
                                            options={[
                                                {
                                                    label: strings.questionsList.create,
                                                    onClick: () => handleAddQuestion()
                                                },
                                                {
                                                    label: strings.questionsList.template,
                                                    onClick: () => showModal('templateSelector')
                                                },
                                                {
                                                    label: strings.questionsList.importCta,
                                                    onClick: () => showModal('questionsImport')
                                                }
                                            ]}
                                            theme="white"
                                        />
                                    </div>
                                )}
                                {allQuestionsFromFormValues.length > 0 && (
                                    <QuestionSkipNav
                                        handleSelect={questionId => setNewestQuestionId(questionId)}
                                        ids={allQuestionsFromFormValues.map(i => i.id)}
                                    />
                                )}
                            </div>
                            {!isLocked && (
                                <div className="mt-4 border-t border-gray-200 pt-4">
                                    <Button
                                        classes="w-full justify-center"
                                        disabled={!hasFormChanged}
                                        onClick={handleFormSubmit}
                                        state={formStatus.status}
                                    >
                                        Save changes
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <div id="questions-end" />
            {interview && (
                <QuestionsImportModal
                    handleSuccess={data => handleImportedQuestions(data)}
                    interview={{
                        id: interviewId,
                        title: interview.title
                    }}
                    project={{
                        id: interview.project.id,
                        title: interview.project.title
                    }}
                    title="Import questions"
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
                                createNewQuestionFromTemplate(template);
                            }
                        }}
                        language={interview?.primary_language}
                        type="question"
                    />
                </SlideOverContent>
                <SlideOverFooter handleClose={hideModal} />
            </SlideOver>
        </PageWrapper>
    );
};

export default QuestionsUpdatePage;
