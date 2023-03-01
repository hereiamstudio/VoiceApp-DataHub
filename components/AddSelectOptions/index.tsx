import React, {useEffect, useRef, useState} from 'react';
import dynamic from 'next/dynamic';
import {useFormikContext} from 'formik';
import Button from '@/components/Button';
import Icon from '@/components/Icon';
import Input from '@/components/Form/Input';
import Tooltip from '@/components/Tooltip';
import strings from '@/locales/en.json';

const OrderListDynamic = dynamic(() => import('@/components/OrderList'));

interface Props {
    handleChange: Function;
    isLocked: boolean;
    name: string;
    options: string[];
}

const AddSelectOptions: React.FC<Props> = ({handleChange, isLocked, name, options = []}: Props) => {
    const [addedOptions, setAddedOptions] = useState(options);
    const [optionText, setOptionText] = useState('');
    const $optionInput = useRef<HTMLInputElement>();

    const handleTextChange = (event: {target: {value: any}}) => {
        const {value} = event.target;

        setOptionText(value);
    };

    const handleRemove = (index: number) => {
        setOptionText('');
        setAddedOptions(addedOptions.filter((_, i) => i !== index));
    };

    const handleAdd = () => {
        if (optionText && !addedOptions.includes(optionText)) {
            setOptionText('');
            setAddedOptions([...addedOptions, optionText]);

            if ($optionInput.current) {
                $optionInput.current.focus();
            }
        }
    };

    /**
     * Every time an option is added or removed we want to send the updated list back to the
     * parent component (where the form is located).
     */
    useEffect(() => {
        handleChange(addedOptions);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [addedOptions]);

    return (
        <>
            <strong className="block font-medium leading-5 text-gray-700 sm:text-sm">
                {strings.questionsCreate.details.optionsList.label}
            </strong>
            <div className="has-rtl mt-1 mb-4 text-sm text-gray-600" data-testid="options-list">
                {addedOptions.length > 0 && (
                    <OrderListDynamic
                        handleChange={setAddedOptions}
                        key={addedOptions.toString()}
                        items={addedOptions.map((option, index) => ({
                            id: option,
                            content: (
                                <div className="w-full">
                                    <Input name={`${name}.${index}`} />
                                </div>
                            ),
                            move:
                                !isLocked && addedOptions.length > 1 ? (
                                    <Tooltip text="Drag to change order">
                                        <Icon
                                            classes="h-5 w-5 flex-shrink-0 scale-90  hover:scale-100 transition duration-200 ease-in-out"
                                            name="move"
                                        />
                                    </Tooltip>
                                ) : null,
                            remove: !isLocked && (
                                <button type="button" onClick={() => handleRemove(index)}>
                                    <Tooltip text="Remove option">
                                        <Icon
                                            classes="h-5 w-5 flex-shrink-0 scale-90 hover:scale-100 hover:text-red-500 transition duration-200 ease-in-out"
                                            name="trash"
                                        />
                                    </Tooltip>
                                </button>
                            )
                        }))}
                    />
                )}
            </div>
            {!isLocked && (
                <div className="flex">
                    <span className="has-rtl flex-grow">
                        <input
                            type="text"
                            className="form-input focus:shadow-outline-pink ease-in-outfocus:outline-none focus:shadow-outline-pink block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm transition duration-150 focus:border-pink-300 focus:ring-2 focus:ring-pink-200 sm:text-sm sm:leading-5"
                            data-testid="add-option-text"
                            name="add-option-text"
                            onChange={handleTextChange}
                            placeholder={strings.questionsCreate.details.optionsList.placeholder}
                            ref={$optionInput}
                            value={optionText}
                        />
                    </span>

                    <Button
                        classes="flex-shrink-0 ml-2"
                        data-testid="add-option-add"
                        disabled={!optionText}
                        icon="plus"
                        onClick={handleAdd}
                        theme="primary"
                    >
                        {strings.questionsCreate.details.optionsList.add}
                    </Button>
                </div>
            )}
        </>
    );
};

export default AddSelectOptions;
