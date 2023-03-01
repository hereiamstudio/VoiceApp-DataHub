import React, {ReactNode, useContext, useEffect, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {useFormikContext} from 'formik';
import AlertModal from '@/components/AlertModal';
import Button from '@/components/Button';
import Icon from '@/components/Icon';
import ModalContext from '@/components/Modal/context';
import AddSkipLogicCta from '@/components/Interviews/AddSkipLogicCta';
import QuestionSkipLogic from '@/components/Interviews/QuestionSkipLogic';
import Tooltip from '@/components/Tooltip';
import {ModalVisibility} from '@/types/index';
import {Question} from '@/types/question';
import {getRandomId} from '@/utils/helpers';

interface Props {
    allQuestions: Partial<Question>[];
    children: ReactNode;
    handleRemovedQuestion: (questionId: string) => void;
    id: string;
    isLocked: boolean;
    isNew: boolean;
    number: number;
}

interface ModalData {
    ctaAction: () => void;
    title: string;
    text: string;
}

const QuestionManagementItem: React.FC<Props> = ({
    allQuestions,
    children,
    handleRemovedQuestion,
    id,
    isLocked,
    isNew,
    number
}: Props) => {
    const [isOpen, setIsOpen] = useState<boolean>(isNew);
    const [modalData, setModalData] = useState<ModalData>(null);
    const {hideModal, modalKey, showModal, visibility} = useContext(ModalContext);
    const formikContext = useFormikContext();
    const values = formikContext.values as Question;
    const canAddSkipLogic =
        number < allQuestions.length && values?.type !== 'free_text' && values.options?.length > 1;
    const hasSkipLogic =
        canAddSkipLogic && values.type !== 'free_text' && values.skip_logic?.length > 0;

    const handleAddSkipLogic = () => {
        const blankLogic = {
            id: getRandomId(),
            action: 'skip_question',
            questionId: null,
            type: 'exactly',
            values: []
        };

        formikContext.setFieldValue(
            `skip_logic`,
            values.skip_logic ? [...values.skip_logic, blankLogic] : [blankLogic]
        );
    };

    const removeSkipLogic = () => {
        formikContext.setFieldValue('skip_logic', null);
        hideModal();
    };

    const handleRemoveSkipLogic = () => {
        if (
            !values.skip_logic?.length ||
            (values.skip_logic?.length > 0 && values.skip_logic[0].action === null)
        ) {
            return removeSkipLogic();
        }

        setModalData({
            ctaAction: removeSkipLogic,
            title: 'Remove skip logic',
            text: 'Are you sure you want to remove skip logic?'
        });
        showModal('confirmation');
    };

    const removeQuestion = () => {
        hideModal();
        handleRemovedQuestion(id);
    };

    const handleRemoveQuestion = () => {
        console.log(values);
        if (!values.title || (values.type !== 'free_text' && !values.options.length)) {
            return removeQuestion();
        }

        setModalData({
            ctaAction: removeQuestion,
            title: 'Remove question',
            text: 'Are you sure you want to remove question? Any options and skip logic will also be removed.'
        });
        setTimeout(() => showModal('confirmation'), 50);
    };

    const handleCancelConfirmation = () => {
        hideModal();
        setTimeout(() => setModalData(null), 500);
    };

    useEffect(() => {
        if (isNew && !isOpen) {
            setIsOpen(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isNew]);

    return (
        <div
            id={id}
            className="shadow sm:rounded-md sm:border sm:border-gray-100"
            data-component="question-item"
            data-label={`${number}. ${values.title}`}
        >
            <div className="relative bg-white">
                <motion.button
                    className="group flex w-full justify-between space-x-4 bg-white bg-opacity-70 px-4 py-5 sm:px-6"
                    initial={false}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <h3 className="text flex-grow text-left font-medium leading-6 text-gray-900 lg:text-[17px]">
                        {number}. {values.title || '...'}
                    </h3>
                    {hasSkipLogic && (
                        <Tooltip text="This question has skip logic" delay={0}>
                            <Icon
                                name="branching"
                                classes="h-6 w-6 flex-shrink-0 mt-0.5 text-gray-600"
                            />
                        </Tooltip>
                    )}
                    <motion.div
                        animate={isOpen ? 'open' : 'collapsed'}
                        initial="collapsed"
                        variants={{
                            open: {rotate: -90},
                            collapsed: {rotate: 90}
                        }}
                        transition={{type: 'spring', stiffness: 200, damping: 30}}
                    >
                        <Icon
                            name="chevron-right"
                            classes={`rounded-full h-6 w-6 duration-200 transition flex-shrink-0 text-gray-600 ${
                                isOpen ? 'bg-gray-200' : 'bg-gray-100 group-hover:bg-gray-200'
                            }`}
                        />
                    </motion.div>
                </motion.button>
                <AnimatePresence initial={false}>
                    <motion.section
                        animate={isOpen ? 'open' : 'collapsed'}
                        initial="collapsed"
                        variants={{
                            open: {opacity: 1, height: 'auto'},
                            collapsed: {
                                opacity: 0,
                                height: 0,
                                transitionEnd: {
                                    height: '0px !important',
                                    overflow: 'hidden'
                                }
                            }
                        }}
                        transition={
                            isOpen
                                ? {type: 'spring', stiffness: 200, damping: 30}
                                : {type: 'spring', stiffness: 300, damping: 35}
                        }
                        className={`${isOpen ? 'h-auto' : 'h-0'}`}
                    >
                        <div className="relative">
                            <div className="-mt-1 px-4 sm:px-6">{children}</div>
                            {canAddSkipLogic && hasSkipLogic && (
                                <QuestionSkipLogic
                                    allQuestions={allQuestions}
                                    handleAdd={handleAddSkipLogic}
                                    id={id}
                                    isLocked={isLocked}
                                    maxItems={
                                        values.options?.length < allQuestions.length - 2
                                            ? values.options.length
                                            : allQuestions.length - 2
                                    }
                                    number={number}
                                    type={values.type === 'single_code' ? 'single' : 'multi'}
                                />
                            )}
                            {isLocked && (
                                <div className="absolute left-0 top-0 right-0 bottom-0 bg-white opacity-30" />
                            )}
                        </div>
                        {!isLocked && (
                            <div className="border-t-2 border-gray-100 bg-gray-50 p-4 sm:px-6">
                                <div className="flex items-center justify-end space-x-2">
                                    {!hasSkipLogic && values.type && values.type !== 'free_text' && (
                                        <AddSkipLogicCta
                                            number={number}
                                            totalOptions={values.options?.length}
                                            totalQuestions={allQuestions.length}
                                            type={values.type}
                                        >
                                            <Button
                                                disabled={!canAddSkipLogic}
                                                theme="secondary"
                                                icon="branching"
                                                classes="animate-fade-in"
                                                onClick={handleAddSkipLogic}
                                            >
                                                Add skip logic
                                            </Button>
                                        </AddSkipLogicCta>
                                    )}
                                    {canAddSkipLogic && hasSkipLogic && (
                                        <Button
                                            theme="destructive"
                                            icon="branching"
                                            classes="animate-fade-in"
                                            onClick={handleRemoveSkipLogic}
                                        >
                                            Remove skip logic
                                        </Button>
                                    )}
                                    <Button
                                        theme="destructive"
                                        icon="trash"
                                        onClick={handleRemoveQuestion}
                                    >
                                        Remove question
                                    </Button>
                                </div>
                            </div>
                        )}
                    </motion.section>
                </AnimatePresence>
            </div>

            {modalData && (
                <AlertModal
                    cancelCta={{
                        label: 'Cancel',
                        onClick: () => handleCancelConfirmation()
                    }}
                    confirmCta={{
                        label: 'Yes, remove',
                        onClick: modalData.ctaAction || null
                    }}
                    handleHide={handleCancelConfirmation}
                    text={modalData.text || ''}
                    title={modalData.title || ''}
                    type="error"
                    visibility={modalKey === 'confirmation' ? visibility : ModalVisibility.HIDDEN}
                />
            )}
        </div>
    );
};

export default QuestionManagementItem;
