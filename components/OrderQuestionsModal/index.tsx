import React, {ReactNode, useContext, useEffect, useRef, useState} from 'react';
import dynamic from 'next/dynamic';
import Button from '@/components/Button';
import {getFieldStyles} from '@/components/FormField';
import LanguageSelector from '@/components/LanguageSelector';
import ModalContext from '@/components/Modal/context';
import {SlideOver, SlideOverContent, SlideOverFooter} from '@/components/Modal/slideOver';
import ToastContext from '@/components/Toast/context';
import strings from '@/locales/en.json';
import {ModalVisibility} from '@/types/index';
import {RequestType} from '@/types/request';
import fetch, {fetchOptions} from '@/utils/fetch';
import {INTERVIEW_LANGUAGES} from '@/utils/interviews';

const OrderListDynamic = dynamic(() => import('@/components/OrderList'));

interface Props {
    defaultLanguage;
    handleClose: Function;
    interviewId: string;
    languages: string[];
    projectId: string;
    questions: Partial<{
        data: Partial<{title: string}>;
        id: string;
    }>[];
    $submit?: ReactNode;
}

const OrderQuestionsModal: React.FC<Props> = ({
    defaultLanguage,
    handleClose,
    interviewId,
    languages,
    projectId,
    questions = []
}: Props) => {
    /**
     * Using ref instead of state is a workound for an issue with custom event handlers and hook state.
     * https://stackoverflow.com/questions/53845595/wrong-react-hooks-behaviour-with-event-listener
     */
    const order = useRef([]);
    const {hideModal, modalKey, visibility} = useContext(ModalContext);
    const [formStatus, setFormStatus] = useState({feedback: '', status: RequestType.DEFAULT});
    const [selectedLanguage, setSelectedLanguage] = useState<string>(defaultLanguage);
    const {addToast} = useContext(ToastContext);

    const getQuestionLabel = question => {
        if (selectedLanguage !== defaultLanguage) {
            return question.translations?.[selectedLanguage]?.title || question.title;
        } else {
            return question.title;
        }
    };

    const handleOrderChange = (newOrder: Partial<{key: string}>[]) => {
        if (order.current) {
            order.current = newOrder.map(i => (typeof i === 'string' ? i : i.key));
        }
    };

    const handleSubmit = async () => {
        setFormStatus({feedback: '', status: RequestType.PENDING});

        if (!order.current) {
            addToast({
                title: strings.questionsList.reorder.orderError.title,
                text: strings.questionsList.reorder.orderError.text,
                type: 'error'
            });
        }

        try {
            const response = await fetch(
                `/api/questions/reorder?projectId=${projectId}&interviewId=${interviewId}`,
                fetchOptions({
                    body: {questionsOrder: order.current},
                    method: 'post'
                })
            );

            addToast({
                title: strings.questionsList.reorder.updateSuccess.title,
                text: strings.questionsList.reorder.updateSuccess.text,
                type: 'success'
            });
            setFormStatus({feedback: '', status: RequestType.DEFAULT});
            handleClose();
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
        if (order.current) {
            order.current = questions.map(i => i.id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <SlideOver
            handleClose={hideModal}
            visibility={modalKey === 'questionsOrder' ? visibility : ModalVisibility.HIDDEN}
        >
            <SlideOverContent
                handleClose={hideModal}
                text={strings.questionsList.reorder.text}
                title={strings.questionsList.reorder.title}
            >
                {languages?.length > 1 && (
                    <LanguageSelector
                        defaultLanguage={defaultLanguage}
                        languages={languages}
                        onChange={setSelectedLanguage}
                        selectedLanguage={selectedLanguage}
                    />
                )}
                <ul
                    className="my-5 list-inside text-sm text-gray-600"
                    data-testid="questions-order-list"
                >
                    <OrderListDynamic
                        handleChange={handleOrderChange}
                        key={selectedLanguage}
                        items={questions.map((question, index) => ({
                            key: question.id,
                            item: (
                                <li key={question.id} className="mb-2">
                                    <Button
                                        classes="block w-full py-[10px] text-md"
                                        icon="move"
                                        iconPosition="left"
                                        labelGrow={true}
                                        theme="orderAndDestructiveOnHover"
                                    >
                                        {getQuestionLabel(question.data)}
                                    </Button>
                                </li>
                            )
                        }))}
                    />
                </ul>
            </SlideOverContent>

            <SlideOverFooter handleClose={hideModal}>
                <Button onClick={handleSubmit} type="button">
                    {strings.questionsList.reorder.submit}
                </Button>
            </SlideOverFooter>
        </SlideOver>
    );
};

export default OrderQuestionsModal;
