import React, {useEffect, useState} from 'react';
import dynamic from 'next/dynamic';
import {useFormikContext} from 'formik';
import Button from '@/components/Button';
import Icon from '@/components/Icon';
import InfoBanner from '@/components/InfoBanner';
import Select from '@/components/Form/Select';
import Tooltip from '@/components/Tooltip';
import {Question} from '@/types/question';
import {getRandomId} from '@/utils/helpers';

const OrderListDynamic = dynamic(() => import('@/components/OrderList'));

interface Props {
    allQuestions: Partial<Question>[];
    handleAdd: () => void;
    id: string;
    isLocked: boolean;
    maxItems: number;
    number: number;
    type?: 'multi' | 'single';
}

const QuestionSkipLogic: React.FC<Props> = ({
    allQuestions,
    handleAdd,
    id,
    isLocked,
    number,
    type
}: Props) => {
    const formikContext = useFormikContext();
    const values = formikContext.values as Question;
    const [order, setOrder] = useState<string[]>([]);
    // Reordering items caused errors in the form values. Adding new items is fine,
    // but reordering is not. When reordering happens we will simply update the order list.
    const [orderKey, setOrderKey] = useState<number>(1);

    const getAvailableOptions = logicIndex => {
        return values.options.filter((option, index) => {
            const isUsedInSkipLogic = values.skip_logic
                .filter((_, i) => i < logicIndex)
                .some(logic => logic?.values?.includes(option));

            return !isUsedInSkipLogic;
        });
    };

    const handleRemove = (id: string) => {
        const updatedOrder = order.filter(i => i !== id);
        const updatedSkipLogic = values.skip_logic.filter(i => updatedOrder.includes(i.id));

        formikContext.setFieldValue('skip_logic', updatedSkipLogic);
        setOrder(updatedOrder);
    };

    const handleValuesChange = (value: string, index: number) => {
        formikContext.setFieldValue(
            `skip_logic[${index}].values`,
            [value]
            // Array.isArray(values.skip_logic[index].values)
            //     ? [...values.skip_logic[index].values, value]
            //     : [value]
        );
    };

    const handleSkipQuestionChange = (value: string, index: number) => {
        formikContext.setFieldValue(`skip_logic[${index}].action`, 'skip_question');
        formikContext.setFieldValue(
            `skip_logic[${index}].questionId`,
            Array.isArray(values.skip_logic[index].values) ? value : [value]
        );
    };

    const handleNewOrder = (newOrder: string[]) => {
        if (order.toString() === newOrder.toString()) {
            return;
        }

        const updatedSkipLogic = newOrder.map(logicId =>
            values.skip_logic.find(i => i.id === logicId)
        );

        formikContext.setFieldValue('skip_logic', updatedSkipLogic);
        setOrder(newOrder);

        if (order.length === newOrder.length) {
            setOrderKey(prevOrder => prevOrder + 1);
        }
    };

    useEffect(() => {
        if (values.skip_logic.length > order.length) {
            setOrder(values.skip_logic.map(v => v?.id || getRandomId()));
        }
    }, [order, values.skip_logic]);

    return (
        <div className="mx-4 mb-4 animate-fade-in sm:mx-6">
            <span className="mb-1 block font-medium leading-5 text-gray-700 sm:text-sm">
                Skip logic
            </span>
            <div className="space-y-2">
                <OrderListDynamic
                    handleChange={handleNewOrder}
                    key={orderKey.toString()}
                    items={order.map((logicId, index) => ({
                        id: logicId,
                        content: (
                            <div
                                key={index}
                                className="flex w-full items-center justify-between space-x-3"
                            >
                                <div className="w-full items-center space-y-3 overflow-hidden text-sm md:flex md:space-y-0 md:space-x-6">
                                    <div className="md:max-w-1/2 flex w-full items-center space-x-2">
                                        <span className="flex-shrink-0 font-medium text-gray-600">
                                            If answer {type === 'single' ? 'is' : 'includes'}
                                        </span>
                                        <div className="w-full">
                                            <Select
                                                name={`skip_logic[${index}].values`}
                                                options={getAvailableOptions(index).map(option => ({
                                                    label: option,
                                                    value: option
                                                }))}
                                                onChange={newValue => {
                                                    handleValuesChange(newValue, index);
                                                }}
                                                placeholder="Select an option"
                                            />
                                        </div>
                                    </div>
                                    <div className="md:max-w-1/2 flex w-full flex-grow items-center space-x-4 text-gray-600">
                                        <span className="flex-shrink-0 font-medium">Skip to</span>
                                        <div className="w-full">
                                            <Select
                                                // disabled={!values.skip_logic[index].values?.length}
                                                name={`skip_logic[${index}].questionId`}
                                                options={allQuestions
                                                    .filter((_, i) => i > number)
                                                    .map(question => ({
                                                        label: question.title,
                                                        value: question.id
                                                    }))}
                                                onChange={newValue => {
                                                    handleSkipQuestionChange(newValue, index);
                                                }}
                                                placeholder="Select a question"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ),
                        move:
                            !isLocked && values.skip_logic.length > 1 ? (
                                <Tooltip text="Drag to change order">
                                    <Icon
                                        classes="h-5 w-5 flex-shrink-0 scale-90  hover:scale-100 transition duration-200 ease-in-out"
                                        name="move"
                                    />
                                </Tooltip>
                            ) : null,
                        remove: !isLocked && (
                            <button type="button" onClick={() => handleRemove(logicId)}>
                                <Tooltip text="Remove skip logic">
                                    <Icon
                                        classes="h-5 w-5 flex-shrink-0 scale-90 hover:scale-100 hover:text-red-500 transition duration-200 ease-in-out"
                                        name="trash"
                                    />
                                </Tooltip>
                            </button>
                        )
                    }))}
                />
            </div>
            {!isLocked &&
                values.skip_logic[0].questionId &&
                values.skip_logic[0].values?.length > 0 &&
                values.skip_logic.length < values.options?.length && (
                    <div className="flex items-center justify-between space-x-4">
                        <span className="animate-fade-in text-sm text-gray-500">
                            All other options will proceed to question {number + 1}
                        </span>
                        <div className="mt-2 text-right">
                            <Button onClick={handleAdd} icon="plus">
                                Add
                            </Button>
                        </div>
                    </div>
                )}
            {!isLocked && values.skip_logic.length === values.options?.length && (
                <div className="mt-4 animate-fade-in">
                    <InfoBanner
                        text={`All options for this question now have skip logic applied. This means that question ${
                            number + 1
                        } will never be shown.`}
                        theme="warning"
                    />
                </div>
            )}
        </div>
    );
};

export default QuestionSkipLogic;
